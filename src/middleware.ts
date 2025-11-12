import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip for static files and API routes
  if (
    pathname.startsWith('/api') ||
    PUBLIC_FILE.test(pathname) ||
    pathname.includes('_next')
  ) {
    return;
  }

  // // Redirect / to /en
  // if (pathname === '/') {
  //   const url = request.nextUrl.clone();
  //   url.pathname = '/en';
  //   return NextResponse.redirect(url);
  // }
}

export const config = {
  matcher: ['/']
};