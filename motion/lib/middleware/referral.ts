import { NextRequest, NextResponse, userAgent } from "next/server";
import { cookies } from "next/headers";

export const referralMiddleware = async (req: NextRequest) => {
  const path = req.nextUrl.pathname;
  const ref = path.split("/")[1];

  if (!ref) {
    return NextResponse.redirect(
      process.env.NODE_ENV === "production" ? "https://motion.zip" : "localhost:3000",
    );
  }

  // check if it is a bot so we can serve custom metadata
  const ua = userAgent(req);
  const isBot = ua.isBot;

  if (isBot) {
    // rewrite to the proxy page
    // so we can serve the referral metadata
    return NextResponse.rewrite(new URL(`/proxy/${ref}`, req.url), {
      headers: { "x-powered-by": "motion.zip", googlebot: "noindex" },
    });
  }

  // redirect to the main domain and set the ref cookie
  const response = NextResponse.redirect(
    process.env.NODE_ENV === "production" ? "https://motion.zip" : "localhost:3000",
    { headers: { "x-powered-by": "motion.zip" } },
  );

  // set the ref cookie
  const cookieStore = await cookies();
  cookieStore.set("ref", ref, {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    domain: process.env.NODE_ENV === "production" ? ".motion.zip" : undefined,
  });

  // return response with cookie
  return response;
};
