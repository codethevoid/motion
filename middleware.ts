import { NextResponse } from "next/server";
import { getToken } from "./lib/middleware/utils/get-token";
import { updateCookie } from "./lib/middleware/utils/update-cookie";

export const middleware = async () => {
  // check if there is a wallet cookie and update it so it expires in 30 days
  const token = await getToken();
  if (token) await updateCookie(token);
  return NextResponse.next({ headers: { "x-powered-by": "TokenOS" } });
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
