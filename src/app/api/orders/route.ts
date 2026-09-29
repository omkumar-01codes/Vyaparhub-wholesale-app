import { NextResponse } from 'next/server';
import { randomBytes, randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { requireSession, handleError } from '@/lib/guard';
import { HttpError, reqNum, round2, str } from '@/lib/validate';
import { calculateItemPrice } from '@/lib/types';
import { computeOrderTotals, dealerStateFromGstin, isIntraState } from '@/lib/gst';

const PAYMENT_MODES = ['CREDIT_DEBT', 'UPI_QR', 'COD_BANK'];

function formatOrder(o: any) {
  return {
    ...o,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i: any) => ({
      productId: i.productId || '',
      productName: i.productName,
      sku: i.sku,
      wholesalePrice: i.wholesalePrice,
      hsnCode: i.hsnCode || undefined,
      gstRate: i.gstRate,
      quantity: i.quantity,
      dispatchedQuantity: i.dispatchedQuantity ?? i.quantity,
      backorderedQuantity: i.backorderedQuantity ?? 0,
      packSize: i.packSize,
      totalPrice: i.totalPrice
    }))
  };
}

export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('error' in auth) return auth.error;
    const { session } = auth;

    const where = session.role === 'RETAILER' ? { customerId: session.customerId || '__none__' } : {};
    const orders = await prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: 'desc' },
      take: 1000
    });
    return NextResponse.json(orders.map(formatOrder));
  } catch (err) {
    return handleError(err, 'orders:GET', 'Failed to fetch orders');
  }
}

/**
 * Prices, tax, discount, customer identity and stock are ALL decided here on the server.
 * The client only says WHICH products and HOW MANY.
 */
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('error' in auth) return auth.error;
    const { session } = auth;

    const body = await req.json().catch(() => ({}));

    // --- who is buying -------------------------------------------------------------
    let customerId: string | null;
    let bookedBy: string | null = null;
    if (session.role === 'RETAILER') {
      if (!session.customerId) throw new HttpError(403, 'Your login is not linked to a store.');
      customerId = session.customerId;
    } else {
      customerId = str(body.customerId, 100) || null;
      if (!customerId) throw new HttpError(400, 'Select a customer for this order.');
      bookedBy =
        session.role === 'SALES_REP'
          ? `${session.name} (Sales Rep)`
          : str(body.bookedBy, 80) || `${session.name} (Dealer)`;
    }

    const paymentMode: string = PAYMENT_MODES.includes(body.paymentMode) ? body.paymentMode : '';
    if (!paymentMode) throw new HttpError(400, 'Invalid payment mode.');

    // --- what is being bought (merge duplicates, validate quantities) --------------
    if (!Array.isArray(body.items) || body.items.length === 0 || body.items.length > 100) {
      throw new HttpError(400, 'Order must contain between 1 and 100 items.');
    }
    const wanted = new Map<string, number>();
    for (const it of body.items) {
      const pid = str(it?.productId, 100);
      if (!pid) throw new HttpError(400, 'Invalid product in order.');
      const q = reqNum(it?.quantity, 'Quantity', { int: true, min: 1, max: 1e6 });
      wanted.set(pid, (wanted.get(pid) || 0) + q);
    }

    const [customer, products, dealerProfile] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.product.findMany({ where: { id: { in: Array.from(wanted.keys()) } }, include: { tiers: true } }),
      prisma.dealerProfile.findUnique({ where: { id: 'dealer-main' } })
    ]);
    if (!customer) throw new HttpError(404, 'Customer not found.');
    if (products.length !== wanted.size) throw new HttpError(400, 'One or more products no longer exist.');

    // --- server-side pricing ---------------------------------------------------------
    const lines = products.map((p) => {
      const qty = wanted.get(p.id)!;
      if (!p.inStock) throw new HttpError(409, `"${p.name}" is out of stock.`);
      if (qty < p.moq) throw new HttpError(400, `Minimum order quantity for "${p.name}" is ${p.moq}.`);
      const { unitPrice } = calculateItemPrice(p as any, qty);
      const totalPrice = round2(unitPrice * qty);
      return { product: p, qty, unitPrice, totalPrice };
    });

    const intra = isIntraState(dealerStateFromGstin(dealerProfile?.gstin), customer.state);
    const totals = computeOrderTotals(
      lines.map((l) => ({ subtotal: l.totalPrice, gstRate: l.product.gstRate })),
      intra
    );

    // E-way bills are issued on the GST portal. We do NOT invent numbers; the dealer
    // enters the real number after generating it (see order PATCH). We only flag the need.
    const notes = str(body.notes, 500) || '';
    const upiReference =
      paymentMode === 'UPI_QR' ? str(body.upiReference, 40) || `UPI-TXN-${randomBytes(4).toString('hex').toUpperCase()}` : null;
    const upiProofNote = str(body.upiProofNote, 300) || null;
    const paymentStatus = paymentMode === 'CREDIT_DEBT' ? 'ADDED_TO_DEBT' : paymentMode === 'UPI_QR' ? 'VERIFICATION_PENDING' : 'PENDING';

    // --- create everything atomically (retry on the rare orderNumber collision) ------
    let created: any = null;
    for (let attempt = 0; attempt < 4 && !created; attempt++) {
      const orderNumber = `ORD-${new Date().getFullYear()}-${randomBytes(3).toString('hex').toUpperCase()}`;
      try {
        created = await prisma.$transaction(async (tx) => {
          // 1. Stock: atomic conditional decrement, so two buyers can't oversell.
          for (const l of lines) {
            const r = await tx.product.updateMany({
              where: { id: l.product.id, stockQty: { gte: l.qty } },
              data: { stockQty: { decrement: l.qty } }
            });
            if (r.count !== 1) {
              const cur = await tx.product.findUnique({ where: { id: l.product.id } });
              throw new HttpError(409, `Insufficient stock for "${l.product.name}". Available: ${cur?.stockQty ?? 0}, requested: ${l.qty}.`);
            }
            await tx.product.updateMany({ where: { id: l.product.id, stockQty: 0 }, data: { inStock: false } });
          }

          // 2. Credit check against fresh values inside the transaction.
          const freshCust = await tx.customer.findUnique({ where: { id: customer.id } });
          if (!freshCust) throw new HttpError(404, 'Customer not found.');
          if (paymentMode === 'CREDIT_DEBT') {
            const available = round2(freshCust.creditLimit - freshCust.outstandingDebt);
            if (totals.totalAmount > available) {
              throw new HttpError(
                409,
                `Credit limit exceeded. Order total ₹${totals.totalAmount.toLocaleString('en-IN')}, available credit ₹${Math.max(0, available).toLocaleString('en-IN')}.`
              );
            }
          }

          // 3. Order + items.
          const order = await tx.order.create({
            data: {
              id: `ord-${randomUUID()}`,
              orderNumber,
              customerId: freshCust.id,
              customerName: freshCust.name,
              customerPhone: freshCust.phone,
              businessName: freshCust.businessName,
              state: freshCust.state,
              city: freshCust.city,
              subtotal: totals.subtotal,
              taxAmount: totals.taxAmount,
              taxType: intra ? 'INTRA_STATE' : 'INTER_STATE',
              cgstAmount: totals.cgstAmount,
              sgstAmount: totals.sgstAmount,
              igstAmount: totals.igstAmount,
              discountAmount: totals.discountAmount,
              totalAmount: totals.totalAmount,
              paymentMode,
              paymentStatus,
              orderStatus: 'CONFIRMED',
              notes,
              bookedBy,
              upiReference,
              upiProofNote,
              items: {
                create: lines.map((l) => ({
                  productId: l.product.id,
                  productName: l.product.name,
                  sku: l.product.sku,
                  hsnCode: l.product.hsnCode,
                  gstRate: l.product.gstRate,
                  wholesalePrice: l.unitPrice,
                  quantity: l.qty,
                  dispatchedQuantity: l.qty,
                  backorderedQuantity: 0,
                  packSize: l.product.packSize,
                  totalPrice: l.totalPrice
                }))
              }
            },
            include: { items: true }
          });

          // 4. Khata ledger for credit orders.
          if (paymentMode === 'CREDIT_DEBT') {
            const updatedDebt = round2(freshCust.outstandingDebt + totals.totalAmount);
            await tx.customer.update({ where: { id: freshCust.id }, data: { outstandingDebt: updatedDebt } });
            await tx.ledgerEntry.create({
              data: {
                id: `led-${randomUUID()}`,
                customerId: freshCust.id,
                customerName: freshCust.name,
                businessName: freshCust.businessName,
                type: 'DEBIT_ORDER',
                amount: totals.totalAmount,
                runningBalance: updatedDebt,
                paymentMode: 'ORDER_CREDIT',
                referenceNumber: orderNumber,
                notes: `Order #${orderNumber} placed on credit${bookedBy ? ` (Booked by ${bookedBy})` : ''}`,
                agingStatus: 'CURRENT'
              }
            });
          }
          return order;
        });
      } catch (e: any) {
        if (e?.code === 'P2002' && String(e?.meta?.target).includes('orderNumber')) continue; // collision -> retry
        throw e;
      }
    }
    if (!created) throw new HttpError(503, 'Could not generate an order number. Please retry.');

    return NextResponse.json(
      { ...formatOrder(created), needsEwayBill: created.totalAmount > 50000 },
      { status: 201 }
    );
  } catch (err) {
    return handleError(err, 'orders:POST', 'Failed to place order');
  }
}
