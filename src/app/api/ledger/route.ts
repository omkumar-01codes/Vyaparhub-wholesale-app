import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { requireSession, handleError } from '@/lib/guard';
import { HttpError, reqNum, reqStr, str } from '@/lib/validate';

const SETTLEMENT_MODES = ['CASH', 'UPI', 'CHEQUE', 'BANK_TRANSFER'];

export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('error' in auth) return auth.error;
    const { session } = auth;

    const where: any = {};
    if (session.role === 'RETAILER') {
      where.customerId = session.customerId || '__none__'; // ignore any query param
    } else {
      const customerId = str(new URL(req.url).searchParams.get('customerId'), 100);
      if (customerId) where.customerId = customerId;
    }

    const entries = await prisma.ledgerEntry.findMany({ where, orderBy: { date: 'desc' }, take: 2000 });
    return NextResponse.json(entries.map((e) => ({ ...e, date: e.date.toISOString() })));
  } catch (err) {
    return handleError(err, 'ledger:GET', 'Failed to fetch ledger entries');
  }
}

// Recording a received payment reduces a customer's debt: dealer / field sales only.
export async function POST(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER', 'SALES_REP']);
    if ('error' in auth) return auth.error;
    const { session } = auth;

    const b = await req.json().catch(() => ({}));
    const customerId = reqStr(b.customerId, 'Customer ID', 100);
    const amount = reqNum(b.amount, 'Amount', { min: 0.01, max: 1e8 });
    const paymentMode = SETTLEMENT_MODES.includes(b.paymentMode) ? b.paymentMode : 'UPI';
    const referenceNumber = str(b.referenceNumber, 60);
    const notes = str(b.notes, 300);

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.findUnique({ where: { id: customerId } });
      if (!customer) throw new HttpError(404, 'Customer not found');
      if (customer.outstandingDebt <= 0) throw new HttpError(409, 'This customer has no outstanding balance.');

      const applied = Math.min(amount, customer.outstandingDebt); // never create negative debt
      const updatedDebt = Math.round((customer.outstandingDebt - applied) * 100) / 100;

      await tx.customer.update({ where: { id: customerId }, data: { outstandingDebt: updatedDebt } });

      const entry = await tx.ledgerEntry.create({
        data: {
          id: `led-${randomUUID()}`,
          customerId,
          customerName: customer.name,
          businessName: customer.businessName,
          type: 'CREDIT_PAYMENT',
          amount: applied,
          runningBalance: updatedDebt,
          paymentMode,
          referenceNumber: referenceNumber || `${paymentMode}-REC-${randomUUID().slice(0, 8).toUpperCase()}`,
          notes: `${notes || `Payment received via ${paymentMode}`} [recorded by ${session.name}]`,
          agingStatus: 'CURRENT'
        }
      });
      return { entry: { ...entry, date: entry.date.toISOString() }, customerBalance: updatedDebt };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleError(err, 'ledger:POST', 'Failed to record payment');
  }
}
