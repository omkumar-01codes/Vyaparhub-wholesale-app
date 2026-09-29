import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import { requireSession, handleError, jsonError } from '@/lib/guard';
import { EMAIL_RE, GSTIN_RE, HttpError, httpsUrl, num, reqNum, reqStr, str } from '@/lib/validate';

export async function GET(req: Request) {
  try {
    const auth = await requireSession(req);
    if ('error' in auth) return auth.error;
    const { session } = auth;

    // Retailers may only see their own customer record.
    const where = session.role === 'RETAILER' ? { id: session.customerId || '__none__' } : {};
    const customers = await prisma.customer.findMany({ where, orderBy: { name: 'asc' } });
    return NextResponse.json(customers);
  } catch (err) {
    return handleError(err, 'customers:GET', 'Failed to fetch customers');
  }
}

export async function POST(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const b = await req.json().catch(() => ({}));
    const email = str(b.email, 120) || '';
    if (email && !EMAIL_RE.test(email)) throw new HttpError(400, 'Enter a valid email address.');
    const gst = str(b.gstNumber, 20)?.toUpperCase();
    if (gst && !GSTIN_RE.test(gst)) throw new HttpError(400, 'Invalid GSTIN.');

    const created = await prisma.customer.create({
      data: {
        id: `cust-${randomUUID()}`,
        name: reqStr(b.name, 'Name', 80),
        businessName: reqStr(b.businessName, 'Business name', 120),
        phone: reqStr(b.phone, 'Phone', 20),
        email,
        state: reqStr(b.state, 'State', 60),
        city: reqStr(b.city, 'City', 60),
        address: str(b.address, 300) || '',
        gstNumber: gst || null,
        creditLimit: num(b.creditLimit, { min: 0, max: 1e8 }) ?? 0,
        outstandingDebt: 0,
        avatarUrl: httpsUrl(b.avatarUrl) || null
      }
    });
    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleError(err, 'customers:POST', 'Failed to create customer');
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const b = await req.json().catch(() => ({}));
    const id = str(b.id, 100);
    if (!id) return jsonError(400, 'Customer ID is required');

    // Whitelist. outstandingDebt is intentionally NOT editable here - it only changes
    // through orders and ledger payments so the ledger always reconciles.
    const data: Record<string, any> = {};
    if (b.name !== undefined) data.name = reqStr(b.name, 'Name', 80);
    if (b.businessName !== undefined) data.businessName = reqStr(b.businessName, 'Business name', 120);
    if (b.phone !== undefined) data.phone = reqStr(b.phone, 'Phone', 20);
    if (b.email !== undefined) {
      const e = str(b.email, 120) || '';
      if (e && !EMAIL_RE.test(e)) throw new HttpError(400, 'Enter a valid email address.');
      data.email = e;
    }
    if (b.state !== undefined) data.state = reqStr(b.state, 'State', 60);
    if (b.city !== undefined) data.city = reqStr(b.city, 'City', 60);
    if (b.address !== undefined) data.address = str(b.address, 300) || '';
    if (b.gstNumber !== undefined) {
      const g = str(b.gstNumber, 20)?.toUpperCase();
      if (g && !GSTIN_RE.test(g)) throw new HttpError(400, 'Invalid GSTIN.');
      data.gstNumber = g || null;
    }
    if (b.creditLimit !== undefined) data.creditLimit = reqNum(b.creditLimit, 'Credit limit', { min: 0, max: 1e8 });
    if (b.lastReminderSent !== undefined) data.lastReminderSent = str(b.lastReminderSent, 40) || null;

    const updated = await prisma.customer.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (err) {
    return handleError(err, 'customers:PUT', 'Failed to update customer');
  }
}
