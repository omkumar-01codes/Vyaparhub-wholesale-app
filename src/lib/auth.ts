import { SignJWT, jwtVerify } from 'jose';

export const SESSION_COOKIE_NAME = 'vyapar_session';

export interface SessionPayload {
  userId: string;
  name: string;
  email: string;
  role: 'DEALER' | 'RETAILER' | 'SALES_REP';
  customerId?: string | null;
  [key: string]: any;
}

let cachedSecret: Uint8Array | null = null;

/**
 * JWT_SECRET is mandatory in production (min 32 chars). There is deliberately no
 * hardcoded production fallback: a known secret would let anyone forge a DEALER token.
 * Resolved lazily so `next build` works without runtime secrets.
 */
function getSecret(): Uint8Array {
  if (cachedSecret) return cachedSecret;
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET must be set to a random string of at least 32 characters in production.');
    }
    console.warn('[auth] JWT_SECRET missing/short - using an insecure DEV-ONLY secret.');
    cachedSecret = new TextEncoder().encode('dev-only-insecure-secret-not-for-production-use');
  } else {
    cachedSecret = new TextEncoder().encode(s);
  }
  return cachedSecret;
}

export async function signSessionToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getSecret());
}

/** Returns null if the token is invalid or expired. Throws only on server misconfiguration. */
export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  const secret = getSecret();
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ['HS256'] });
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
