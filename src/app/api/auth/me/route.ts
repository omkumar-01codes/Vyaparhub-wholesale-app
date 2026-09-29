import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSession, handleError } from '@/lib/guard';

// Identity comes ONLY from the signed session cookie. Never from a query parameter.
export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session) return NextResponse.json({ user: null });

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { customer: true }
    });
    if (!user) return NextResponse.json({ user: null });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        customerId: user.customerId,
        avatarUrl: user.avatarUrl
      },
      customer: user.customer || null
    });
  } catch (err) {
    return handleError(err, 'me');
  }
}
