import { NextRequest, NextResponse, userAgent } from "next/server";
import { getToken } from "./lib/middleware/utils/get-token";
import { updateCookie } from "./lib/middleware/utils/update-cookie";
import { cookies } from "next/headers";

export const middleware = async (req: NextRequest) => {
  // check if there is a wallet cookie and update it so it expires in 30 days
  const token = await getToken();
  if (token) await updateCookie(token);

  let host = req.headers.get("host") || "";
  host = host.replace("www.", "").toLowerCase();

  if (host === "tokenos.one" || host === "localhost:3000") {
    // continue like normal
    return NextResponse.next({ headers: { "x-powered-by": "TokenOS" } });
  }

  // else it is a referral
  // because we use a different subdomain for referral links
  // get the ref from the pathname
  const path = req.nextUrl.pathname;
  const ref = path.split("/")[1];
  if (!ref) {
    return NextResponse.redirect(
      process.env.NODE_ENV === "production" ? "https://tokenos.one" : "localhost:3000",
    );
  }

  // check if it is a bot so we can serve custom metadata
  const ua = userAgent(req);
  const isBot = ua.isBot;

  if (isBot) {
    // rewrite to the proxy page
    // so we can serve the referral metadata
    return NextResponse.rewrite(new URL(`/proxy/${ref}`, req.url), {
      headers: { "x-powered-by": "TokenOS", googlebot: "noindex" },
    });
  }

  // redirect to the main domain and set the ref cookie
  const response = NextResponse.redirect(
    process.env.NODE_ENV === "production" ? "https://tokenos.one" : "localhost:3000",
    {
      headers: { "x-powered-by": "TokenOS" },
    },
  );

  // set the ref cookie
  const cookieStore = await cookies();
  cookieStore.set("ref", ref, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production" ? ".tokenos.one" : undefined,
  });

  // return response with cookie
  return response;
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
