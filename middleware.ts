import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "./lib/middleware/utils/get-token";
import { updateCookie } from "./lib/middleware/utils/update-cookie";
import { cookies } from "next/headers";

export const middleware = async (req: NextRequest) => {
  // check if there is a wallet cookie and update it so it expires in 30 days
  const token = await getToken();
  if (token) await updateCookie(token);

  // check for reference in in the url (for referral links)
  const ref = req.nextUrl.searchParams.get("ref");
  if (ref) {
    // check if bot and serve custom metadata
    const ua = userAgent(req);
    const isBot = ua.isBot;

    if (isBot) {
      // rewrite to the proxy page
      // so we can serve the referral metadata
      return NextResponse.rewrite(new URL(`/proxy?ref=${ref}`, req.url), {
        headers: { "x-powered-by": "TokenOS", googlebot: "noindex" },
      });
    }

    // create new url to work with
    const url = req.nextUrl.clone();

    // remove the ref from the url
    url.searchParams.delete("ref");

    // create new response
    const response = NextResponse.redirect(url, {
      headers: { "x-powered-by": "TokenOS" },
    });

    // set the ref cookie
    const cookieStore = await cookies();
    cookieStore.set("ref", ref, {
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    // return response with cookie
    return response;
  }

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
