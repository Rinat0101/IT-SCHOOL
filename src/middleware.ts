import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_FILE = /\.(.*)$/;

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 🧩 Skip middleware for API routes, static files, Next internals
  if (
    pathname.startsWith("/api") ||
    PUBLIC_FILE.test(pathname) ||
    pathname.includes("_next")
  ) {
    return NextResponse.next();
  }

  // 🧠 Decode the JWT to read session info (role, id)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // 1️⃣ No session → redirect to /login
  if (!token && pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // 2️⃣ Has session → redirect root ("/") or "/login" to /courses
  if (token && (pathname === "/" || pathname === "/login")) {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  // 3️⃣ Admin-only: /admin/* requires role === "admin"
  if (pathname.startsWith("/admin") && token?.role !== "admin") {
    return NextResponse.redirect(new URL("/courses", request.url));
  }

  // ✅ Otherwise allow
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon.ico|images|api).*)"], // applies to everything except static/api
};