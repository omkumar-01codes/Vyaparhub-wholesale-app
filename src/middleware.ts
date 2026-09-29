import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from './lib/auth';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect Dealer routes
  const isDealerRoute = pathname.startsWith('/dealer');
  const isDealerApi = pathname.startsWith('/api/dealer');
  const isSalesRoute = pathname.startsWith('/sales');

  if (!isDealerRoute && !isDealerApi && !isSalesRoute) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await verifySessionToken(token) : null;

  // 1. Dealer Page Route Protection
  if (isDealerRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'dealer_auth_required');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'DEALER') {
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(homeUrl);
    }
  }

  // 2. Dealer API Route Protection
  if (isDealerApi) {
    if (!session || session.role !== 'DEALER') {
      return NextResponse.json(
        { error: 'Unauthorized: Wholesaler Dealer access required.' },
        { status: 403 }
      );
    }
  }

  // 3. Salesman Page Route Protection
  if (isSalesRoute) {
    if (!session) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('error', 'sales_auth_required');
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (session.role !== 'SALES_REP' && session.role !== 'DEALER') {
      const homeUrl = new URL('/', req.url);
      homeUrl.searchParams.set('error', 'unauthorized_role');
      return NextResponse.redirect(homeUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dealer/:path*',
    '/sales/:path*',
    '/api/dealer/:path*'
  ]
};
