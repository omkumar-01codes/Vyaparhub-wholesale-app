import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { initialDealerProfile } from '@/lib/db';
import { requireSession, handleError } from '@/lib/guard';
import { HttpError, reqStr, str, GSTIN_RE, EMAIL_RE } from '@/lib/validate';

// Middleware already gates /api/dealer; we re-check here (defence in depth).
export async function GET(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    let profile = await prisma.dealerProfile.findUnique({ where: { id: 'dealer-main' } });
    if (!profile) {
      profile = await prisma.dealerProfile.create({ data: { id: 'dealer-main', ...initialDealerProfile } });
    }
    return NextResponse.json(profile);
  } catch (err) {
    return handleError(err, 'dealer:GET', 'Failed to fetch dealer profile');
  }
}

export async function PUT(req: Request) {
  try {
    const auth = await requireSession(req, ['DEALER']);
    if ('error' in auth) return auth.error;

    const b = await req.json().catch(() => ({}));
    const data: Record<string, string> = {};
    const fields: [string, number][] = [
      ['name', 80], ['businessName', 120], ['tagline', 160], ['phone', 20], ['address', 300],
      ['upiId', 80], ['upiName', 80], ['bankAccount', 30], ['ifscCode', 15], ['bankName', 120]
    ];
    for (const [k, max] of fields) if (b[k] !== undefined) data[k] = reqStr(b[k], k, max);
    if (b.email !== undefined) {
      const e = reqStr(b.email, 'email', 120);
      if (!EMAIL_RE.test(e)) throw new HttpError(400, 'Invalid email.');
      data.email = e;
    }
    if (b.gstin !== undefined) {
      const g = (str(b.gstin, 20) || '').toUpperCase();
      if (!GSTIN_RE.test(g)) throw new HttpError(400, 'Invalid GSTIN.');
      data.gstin = g;
    }

    const profile = await prisma.dealerProfile.upsert({
      where: { id: 'dealer-main' },
      update: data,
      create: { id: 'dealer-main', ...initialDealerProfile, ...data }
    });
    return NextResponse.json(profile);
  } catch (err) {
    return handleError(err, 'dealer:PUT', 'Failed to update dealer profile');
  }
}
