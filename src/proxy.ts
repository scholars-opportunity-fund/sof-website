import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Edge proxy (formerly `middleware`) for Scholar Opportunity Fund.
 *
 * - Canonicalize apex → www for the production domain.
 * - Strip trailing slashes (except root) to match `trailingSlash: false`.
 *
 * Override the apex domain via `NEXT_PUBLIC_APEX_HOST` if the production
 * hostname differs (e.g. `scholarsoppfund.com`).
 */
const APEX_HOST =
  process.env.NEXT_PUBLIC_APEX_HOST?.replace(/^https?:\/\//, "") ||
  "scholaroppfund.com";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get("host") || "";

  // Enforce www canonical (apex → www)
  if (
    hostname === APEX_HOST &&
    !hostname.startsWith("localhost") &&
    !hostname.startsWith("127.0.0.1")
  ) {
    url.hostname = `www.${APEX_HOST}`;
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|og).*)"],
};
