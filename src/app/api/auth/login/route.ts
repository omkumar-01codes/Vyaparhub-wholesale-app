import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken } from '@/lib/auth';
import { setSessionCookie, rateLimit, clientIp, jsonError, handleError } from '@/lib/guard';
import { normalizePhone } from '@/lib/validate';

let dummyHash: string | null = null; // used so unknown users cost the same time as wrong passwords

export async function POST(req: Request) {
  try {
    const ip = clientIp(req);
    if (!rateLimit(`login:ip:${ip}`, 30, 15 * 60_000)) {
      return jsonError(429, 'Too many login attempts. Please try again in a few minutes.');
    }

    const body = await req.json().catch(() => ({}));
    const identifierRaw = typeof body.identifier === 'string' ? body.identifier.trim() : '';
    const password = typeof body.password === 'string' ? body.password : '';

    if (!identifierRaw || !password || identifierRaw.length > 120 || password.length > 200) {
      return jsonError(400, 'Email/Phone and password are required');
    }

    const identifier = identifierRaw.includes('@')
      ? identifierRaw.toLowerCase()
      : normalizePhone(identifierRaw) || identifierRaw.toLowerCase();

    if (!rateLimit(`login:id:${identifier}`, 8, 15 * 60_000)) {
      return jsonError(429, 'Too many login attempts for this account. Please try again later.');
    }

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { phone: identifier }] },
      include: { customer: true }
    });

    if (!dummyHash) dummyHash = bcrypt.hashSync('not-a-real-password', 10);
    let valid = false;
    try {
      valid = await bcrypt.compare(password, user ? user.password : dummyHash);
    } catch {
      valid = false;
    }

    // Single generic message: do not reveal whether the account exists.
    if (!user || !valid) {
      return jsonError(401, 'Invalid email/phone or password.');
    }

    const token = await signSessionToken({
      userId: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      customerId: user.customerId
    });

    const response = NextResponse.json({
      success: true,
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
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    return handleError(err, 'login', 'Login failed. Please try again.');
  }
}
