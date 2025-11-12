import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_FILE = /\.(.*)$/;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🧩 Skip middleware for API routes, static files, Next internals
  if (
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname) ||
    pathname.includes("_next")
  ) {
    return NextResponse.next();
  }

  // 🧠 Read session token (for NextAuth)
  const sessionToken =
    request.cookies.get("next-auth.session-token")?.value ||
    request.cookies.get("__Secure-next-auth.session-token")?.value;

  // 1️⃣ No session → redirect to /login
  if (!sessionToken && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ Has session → redirect root ("/") or "/login" to /courses
  if (sessionToken && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  // ✅ Otherwise allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|api).*)"], // applies to everything except static/api
};