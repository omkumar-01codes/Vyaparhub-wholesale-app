import { NextResponse } from 'next/server';
import { createHmac, randomUUID, timingSafeEqual } from 'crypto';
import prisma from '@/lib/prisma';
import { jsonError, handleError } from '@/lib/guard';
import { round2 } from '@/lib/validate';

// Public endpoint, protected by an HMAC signature of the RAW body.
// Razorpay: header `x-razorpay-signature` = hex(HMAC_SHA256(rawBody, webhookSecret)).
// Adapt the header name / payload paths below if you use another gateway.
function signatureValid(raw: string, header: string | null, secret: string): boolean {
  if (!header) return false;
  const expected = createHmac('sha256', secret).update(raw).digest('hex');
  const a = Buffer.from(expected);
  const b = Buffer.from(header.trim());
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function POST(req: Request) {
  try {
    const secret = process.env.WEBHOOK_SECRET;
    if (!secret || secret.length < 16) {
      console.error('[webhook] WEBHOOK_SECRET is not configured - rejecting all webhook calls.');
      return jsonError(503, 'Webhook not configured.');
    }

    const raw = await req.text();
    const sig = req.headers.get('x-razorpay-signature') || req.headers.get('x-webhook-signature');
    if (!signatureValid(raw, sig, secret)) return jsonError(401, 'Invalid signature.');

    let body: any;
    try {
      body = JSON.parse(raw);
    } catch {
      return jsonError(400, 'Invalid JSON.');
    }

    const entity = body?.payload?.payment?.entity;
    const event: string | undefined = body?.event;
    const captured = event === 'payment.captured' && (entity ? entity.status === 'captured' : body?.status === 'SUCCESS');
    if (!captured) return NextResponse.json({ message: 'Ignored: not a captured payment.' });

    const orderNumber: string | undefined = body.orderNumber || entity?.notes?.orderNumber;
    const orderId: string | undefined = body.orderId || entity?.notes?.orderId;
    if (!orderNumber && !orderId) return jsonError(400, 'orderNumber or orderId is required.');

    // Razorpay sends paise inside `payload`; the flat custom format sends rupees.
    const paidAmount: number | undefined = entity?.amount !== undefined ? entity.amount / 100 : Number(body.amount);
    const paymentRef: string =
      String(body.utr || body.referenceNumber || entity?.acquirer_data?.rrn || entity?.id || `WEBHOOK-${randomUUID().slice(0, 8)}`).slice(0, 60);

    const order = await prisma.order.findFirst({
      where: { OR: [...(orderId ? [{ id: orderId }] : []), ...(orderNumber ? [{ orderNumber }] : [])] }
    });
    if (!order) return jsonError(404, 'Order not found.');

    if (order.paymentStatus === 'PAID') {
      return NextResponse.json({ success: true, message: 'Order was already marked as PAID', orderNumber: order.orderNumber });
    }

    // The amount must match what WE computed for the order. Never trust the payload total.
    if (paidAmount === undefined || !Number.isFinite(paidAmount) || Math.abs(round2(paidAmount) - order.totalAmount) > 0.01) {
      console.error(`[webhook] amount mismatch for ${order.orderNumber}: paid=${paidAmount} expected=${order.totalAmount}`);
      return jsonError(422, 'Paid amount does not match the order total.');
    }

    const result = await prisma.$transaction(async (tx) => {
      // Conditional update makes concurrent duplicate deliveries idempotent.
      const flipped = await tx.order.updateMany({
        where: { id: order.id, paymentStatus: { not: 'PAID' } },
        data: {
          paymentStatus: 'PAID',
          upiReference: paymentRef,
          verifiedAt: new Date().toISOString(),
          notes: `${order.notes || ''} [Auto-settled via webhook: ${paymentRef}]`.trim()
        }
      });
      if (flipped.count === 0) return { alreadyPaid: true };

      // Only credit-purchase orders created a debt, so only those reduce it. A directly
      // paid (UPI/COD) order must not wipe out unrelated Khata balance.
      if (order.paymentMode === 'CREDIT_DEBT' && order.customerId) {
        const customer = await tx.customer.findUnique({ where: { id: order.customerId } });
        if (customer) {
          const applied = Math.min(order.totalAmount, customer.outstandingDebt);
          const updatedDebt = round2(customer.outstandingDebt - applied);
          await tx.customer.update({ where: { id: customer.id }, data: { outstandingDebt: updatedDebt } });
          await tx.ledgerEntry.create({
            data: {
              id: `led-${randomUUID()}`,
              customerId: customer.id,
              customerName: customer.name,
              businessName: customer.businessName,
              type: 'CREDIT_PAYMENT',
              amount: applied,
              runningBalance: updatedDebt,
              paymentMode: 'UPI',
              referenceNumber: paymentRef,
              notes: `Gateway webhook settlement for ${order.orderNumber}`
            }
          });
        }
      }
      return { alreadyPaid: false };
    });

    return NextResponse.json({
      success: true,
      message: result.alreadyPaid ? 'Order was already settled' : 'Payment captured and recorded',
      orderNumber: order.orderNumber
    });
  } catch (err) {
    return handleError(err, 'webhook:payment', 'Webhook processing failed');
  }
}
