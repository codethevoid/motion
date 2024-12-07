import { NextResponse, NextRequest } from "next/server";
import { appDomain, protocol } from "./utils";
import { appMiddleware } from "./lib/middleware/app";
import { getToken } from "./lib/middleware/utils/get-token";

export const middleware = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;
  const host = req.headers.get("host")?.replace("www.", "") ?? null;

  if (host === appDomain) {
    return appMiddleware(req);
  }

  // if token, redirect to app domain
  if (path === "/") {
    const token = await getToken();
    if (token) return NextResponse.redirect(`${protocol}${appDomain}`);
  }

  // otherwise, rewrite to the main domain (davincii.io)
  // which lives in /main
  return NextResponse.rewrite(new URL(`/main${path === "/" ? "" : path}`, req.url));
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
