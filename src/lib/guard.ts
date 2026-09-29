import { NextResponse } from 'next/server';
import prisma from './prisma';
import { verifySessionToken, SESSION_COOKIE_NAME, type SessionPayload } from './auth';
import { HttpError } from './validate';

export type Role = SessionPayload['role'];

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie') || '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

/**
 * Verifies the signed cookie AND re-reads the user from the DB, so deleted users or
 * changed roles lose access immediately instead of after the 7-day token expiry.
 */
export async function getSession(req: Request): Promise<SessionPayload | null> {
  const token = readCookie(req, SESSION_COOKIE_NAME);
  if (!token) return null;
  const claims = await verifySessionToken(token);
  if (!claims?.userId) return null;
  const user = await prisma.user.findUnique({ where: { id: claims.userId } });
  if (!user) return null;
  return {
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role as Role,
    customerId: user.customerId
  };
}

export function jsonError(status: number, error: string) {
  return NextResponse.json({ error }, { status });
}

/** Usage: const auth = await requireSession(req, ['DEALER']); if ('error' in auth) return auth.error; */
export async function requireSession(
  req: Request,
  roles?: Role[]
): Promise<{ session: SessionPayload } | { error: NextResponse }> {
  const session = await getSession(req);
  if (!session) return { error: jsonError(401, 'Please log in to continue.') };
  if (roles && !roles.includes(session.role)) {
    return { error: jsonError(403, 'You do not have permission to do this.') };
  }
  return { session };
}

/** Maps thrown errors to safe responses. Internal messages are logged, never returned. */
export function handleError(err: unknown, label: string, fallback = 'Something went wrong.') {
  if (err instanceof HttpError) return jsonError(err.status, err.message);
  const code = (err as any)?.code;
  if (code === 'P2025') return jsonError(404, 'Record not found.');
  if (code === 'P2002') return jsonError(409, 'A record with these details already exists.');
  console.error(`[${label}]`, err);
  return jsonError(500, fallback);
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
}

// --- Minimal in-memory rate limiter -------------------------------------------------
// NOTE: per server instance only. On serverless / multi-instance hosting use a shared
// store (Upstash Redis, Vercel KV, etc.) instead.
const buckets = new Map<string, { count: number; reset: number }>();

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.reset < now) {
    buckets.set(key, { count: 1, reset: now + windowMs });
    if (buckets.size > 5000) {
      buckets.forEach((v, k) => v.reset < now && buckets.delete(k));
    }
    return true;
  }
  b.count += 1;
  return b.count <= limit;
}

export function clientIp(req: Request): string {
  return (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
}
