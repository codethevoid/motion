import { NextRequest, NextResponse } from "next/server";
import { getToken } from "./lib/middleware/utils/get-token";
import { updateCookie } from "./lib/middleware/utils/update-cookie";
import { xrpLedgerMiddleware } from "./lib/middleware/xrp-ledger";
import { referralMiddleware } from "./lib/middleware/referral";

export const middleware = async (req: NextRequest) => {
  let host = req.headers.get("host") || "";
  host = host.replace("www.", "").toLowerCase();
  const path = req.nextUrl.pathname;

  // check if it is a request to get the xrp ledger toml file
  if (path === "/.well-known/xrp-ledger.toml") {
    return xrpLedgerMiddleware(req);
  }

  if (path.includes("/.well-known") || path === "/sitemap.xml" || path === "/robots.txt") {
    return NextResponse.next({ headers: { "x-powered-by": "motion.zip" } });
  }

  if (process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true" && path !== "/maintenance") {
    return NextResponse.redirect(
      process.env.NODE_ENV === "production"
        ? "https://motion.zip/maintenance"
        : "http://localhost:3000/maintenance",
      { headers: { "x-powered-by": "motion.zip" } },
    );
  }

  if (host === "motion.zip" || host === "localhost:3000") {
    // check if there is a wallet cookie and update it so it expires in 30 days
    const token = await getToken();
    if (token) {
      // update the cookie so it expires in 30 days
      const response = NextResponse.next({ headers: { "x-powered-by": "motion.zip" } });
      response.cookies.set("wallet", token, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });
      return response;
    }

    // if there is no wallet cookie, continue with request like normal
    return NextResponse.next({ headers: { "x-powered-by": "motion.zip" } });
  }

  // go.motion.zip to process referral links
  if (host === "go.motion.zip") {
    return referralMiddleware(req);
  }

  if (host === "docs.motion.zip") {
    return NextResponse.redirect("https://tokenos.mintlify.app");
  }

  // else, request is coming from an unknown subdomain
  // and the path is not a request to get the xrp ledger toml
  // so we redirect to the main domain
  return NextResponse.redirect(
    process.env.NODE_ENV === "production" ? "https://motion.zip" : "localhost:3000",
    { headers: { "x-powered-by": "motion.zip" } },
  );
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
