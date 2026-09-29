import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signSessionToken } from '@/lib/auth';
import { setSessionCookie, rateLimit, clientIp, jsonError, handleError } from '@/lib/guard';
import { EMAIL_RE, GSTIN_RE, HttpError, normalizePhone, reqStr, str } from '@/lib/validate';

// New accounts start with NO credit. The dealer raises the limit after checking the shop.
// Override with NEW_ACCOUNT_CREDIT_LIMIT if you really want a welcome line.
const NEW_ACCOUNT_CREDIT_LIMIT = Math.max(0, Number(process.env.NEW_ACCOUNT_CREDIT_LIMIT ?? 0)) || 0;

export async function POST(req: Request) {
  try {
    if (!rateLimit(`register:ip:${clientIp(req)}`, 5, 60 * 60_000)) {
      return jsonError(429, 'Too many sign-ups from this network. Please try again later.');
    }

    const body = await req.json().catch(() => ({}));
    const businessName = reqStr(body.businessName, 'Store name', 120);
    const ownerName = reqStr(body.ownerName, 'Owner name', 80);
    const state = reqStr(body.state, 'State', 60);
    const city = reqStr(body.city, 'City', 60);
    const address = str(body.address, 300) || '';

    const phone = normalizePhone(typeof body.phone === 'string' ? body.phone : '');
    if (!phone) throw new HttpError(400, 'Enter a valid 10-digit Indian mobile number.');

    const password = typeof body.password === 'string' ? body.password : '';
    if (password.length < 8 || password.length > 72) {
      throw new HttpError(400, 'Password must be 8 to 72 characters.');
    }

    const emailInput = str(body.email, 120);
    if (emailInput && !EMAIL_RE.test(emailInput)) throw new HttpError(400, 'Enter a valid email address.');
    const email = (emailInput || `${phone}@vyaparhub.local`).toLowerCase();

    const gstInput = str(body.gstNumber, 20)?.toUpperCase();
    if (gstInput && !GSTIN_RE.test(gstInput)) throw new HttpError(400, 'Enter a valid 15-character GSTIN or leave it blank.');

    const existing = await prisma.user.findFirst({ where: { OR: [{ phone }, { email }] } });
    if (existing) {
      return jsonError(409, 'An account with this phone number or email already exists. Please log in.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const customerId = `cust-${randomUUID()}`;
    const userId = `usr-${randomUUID()}`;

    const result = await prisma.$transaction(async (tx) => {
      const customer = await tx.customer.create({
        data: {
          id: customerId,
          name: ownerName,
          businessName,
          phone,
          email,
          state,
          city,
          address,
          gstNumber: gstInput || null,
          creditLimit: NEW_ACCOUNT_CREDIT_LIMIT,
          outstandingDebt: 0
        }
      });
      const user = await tx.user.create({
        data: {
          id: userId,
          name: ownerName,
          email,
          phone,
          password: hashedPassword,
          role: 'RETAILER',
          customerId: customer.id
        }
      });
      return { user, customer };
    });

    const token = await signSessionToken({
      userId: result.user.id,
      name: result.user.name,
      email: result.user.email,
      role: 'RETAILER',
      customerId: result.customer.id
    });

    const response = NextResponse.json(
      {
        success: true,
        message: 'Store registered successfully!',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          phone: result.user.phone,
          role: result.user.role,
          customerId: result.user.customerId,
          avatarUrl: result.user.avatarUrl
        },
        customer: result.customer
      },
      { status: 201 }
    );
    setSessionCookie(response, token);
    return response;
  } catch (err) {
    return handleError(err, 'register', 'Registration failed. Please try again.');
  }
}
