import { NextResponse } from 'next/server';
import { clearSessionCookie } from '@/lib/guard';

// The session cookie is httpOnly, so the browser cannot clear it itself.
export async function POST() {
  const res = NextResponse.json({ success: true });
  clearSessionCookie(res);
  return res;
}
