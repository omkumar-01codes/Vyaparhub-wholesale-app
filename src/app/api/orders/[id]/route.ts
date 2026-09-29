import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireSession, handleError } from '@/lib/guard';
import { HttpError, num, str } from '@/lib/validate';

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'PARTIALLY_DISPATCHED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'];
const PAYMENT_STATUSES = ['PAID', 'ADDED_TO_DEBT', 'PENDING', 'VERIFICATION_PENDING', 'REJECTED'];

// Only the dealer manages fulfilment / payment verification.
export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const { id } = params;
    const b = await req.json().catch(() => ({}));

    const data: Record<string, any> = {};
    if (b.orderStatus !== undefined) {
      if (!ORDER_STATUSES.includes(b.orderStatus)) throw new HttpError(400, 'Invalid order status.');
      data.orderStatus = b.orderStatus;
    }
    if (b.paymentStatus !== undefined) {
      if (!PAYMENT_STATUSES.includes(b.paymentStatus)) throw new HttpError(400, 'Invalid payment status.');
      data.paymentStatus = b.paymentStatus;
    }
    if (b.verifiedAt !== undefined) data.verifiedAt = b.verifiedAt === null ? null : str(b.verifiedAt, 40) || null;
    if (b.rejectionReason !== undefined) data.rejectionReason = b.rejectionReason === null ? null : str(b.rejectionReason, 300) || null;
    if (b.deliveryChallanNumber !== undefined) data.deliveryChallanNumber = str(b.deliveryChallanNumber, 40) || null;
    // Real e-way bill details, entered by the dealer after generating it on the GST portal.
    if (b.ewayBillNumber !== undefined) data.ewayBillNumber = str(b.ewayBillNumber, 20) || null;
    if (b.ewayBillValidUntil !== undefined) data.ewayBillValidUntil = str(b.ewayBillValidUntil, 40) || null;
    if (b.transporterId !== undefined) data.transporterId = str(b.transporterId, 30) || null;
    if (b.transporterName !== undefined) data.transporterName = str(b.transporterName, 100) || null;
    if (b.vehicleNumber !== undefined) data.vehicleNumber = str(b.vehicleNumber, 20) || null;

    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({ where: { id }, include: { items: true } });
      if (!existing) throw new HttpError(404, 'Order not found.');

      if (Array.isArray(b.items)) {
        for (const item of b.items) {
          const target = existing.items.find((i) => i.productId && i.productId === item.productId);
          if (!target) continue;
          const dispatched = num(item.dispatchedQuantity, { int: true, min: 0, max: target.quantity });
          if (dispatched === undefined) throw new HttpError(400, 'Invalid dispatched quantity.');
          await tx.orderItem.update({
            where: { id: target.id },
            data: { dispatchedQuantity: dispatched, backorderedQuantity: target.quantity - dispatched }
          });
        }
      }

      return tx.order.update({ where: { id }, data, include: { items: true } });
    });

    return NextResponse.json({
      ...updated,
      createdAt: updated.createdAt.toISOString(),
      items: updated.items.map((i) => ({
        productId: i.productId || '',
        productName: i.productName,
        sku: i.sku,
        wholesalePrice: i.wholesalePrice,
        quantity: i.quantity,
        dispatchedQuantity: i.dispatchedQuantity ?? i.quantity,
        backorderedQuantity: i.backorderedQuantity ?? 0,
        packSize: i.packSize,
        totalPrice: i.totalPrice
      }))
    });
  } catch (err) {
    return handleError(err, 'orders:PATCH', 'Failed to update order');
  }
}
