import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, handleError } from '@/lib/guard';

// Public, non-sensitive slice of the dealer profile, needed by retailers at checkout
// (UPI QR / contact). Bank account details are added only for logged-in users.
export async function GET(req: Request) {
  try {
    const p = await prisma.dealerProfile.findUnique({ where: { id: 'dealer-main' } });
    if (!p) return NextResponse.json({});
    const session = await getSession(req);
    return NextResponse.json({
      ...(session ? { bankAccount: p.bankAccount, ifscCode: p.ifscCode, bankName: p.bankName } : {}),
      businessName: p.businessName,
      tagline: p.tagline,
      phone: p.phone,
      address: p.address,
      gstin: p.gstin,
      upiId: p.upiId,
      upiName: p.upiName
    });
  } catch (err) {
    return handleError(err, 'store-profile');
  }
}
