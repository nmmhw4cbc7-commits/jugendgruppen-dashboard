import { NextRequest, NextResponse } from "next/server";

const MEMBER_COOKIE = "yg_member_id";
const ADMIN_COOKIE = "yg_admin_session";

const MEMBER_ROUTES = ["/neues", "/anliegen", "/einstellungen"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const hasAdminCookie = req.cookies.has(ADMIN_COOKIE);
    if (!hasAdminCookie) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    return NextResponse.next();
  }

  if (MEMBER_ROUTES.some((r) => pathname.startsWith(r))) {
    const hasMemberCookie = req.cookies.has(MEMBER_COOKIE);
    if (!hasMemberCookie) {
      return NextResponse.redirect(new URL("/onboarding", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/neues/:path*", "/anliegen/:path*", "/einstellungen/:path*", "/admin/:path*"],
};
