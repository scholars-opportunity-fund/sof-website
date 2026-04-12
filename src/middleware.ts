import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Enforce www canonical (non-www → www)
  if (
    hostname === "scholarsoppfund.com" &&
    !hostname.startsWith("localhost") &&
    !hostname.startsWith("127.0.0.1")
  ) {
    url.hostname = "www.scholarsoppfund.com";
    return NextResponse.redirect(url, 301);
  }

  // Strip trailing slashes (except root)
  if (url.pathname !== "/" && url.pathname.endsWith("/")) {
    url.pathname = url.pathname.slice(0, -1);
    return NextResponse.redirect(url, 301);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|images|og).*)",
  ],
};
