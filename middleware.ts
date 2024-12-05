import { NextResponse, NextRequest } from "next/server";

export const middleware = (req: NextRequest) => {
  const path = req.nextUrl.pathname
  const host = req.headers.get('host');

  if (host?.includes("app.")) {
    return NextResponse.rewrite(new URL(`/app.davincii.io${path === "/" ? "" : path}`, req.url));
  }

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
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)"
  ],
};
