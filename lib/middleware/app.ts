import { NextRequest, NextResponse } from "next/server";
import { getToken } from "./utils/get-token";
import { updateCookie } from "./utils/update-cookie";

export const appMiddleware = async (req: NextRequest) => {
  const token = await getToken();
  const path = req.nextUrl.pathname;

  // if no token, redirect to /new if path is not /new or /import
  if (!token && path !== "/new" && path !== "/import") {
    return NextResponse.redirect(new URL("/new", req.url));
  }

  // if token, update cookie and redirect to / if path is /new or /import
  if (token) {
    await updateCookie(token as string);
    if (path === "/new" || path === "/import") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.rewrite(new URL(`/app.davincii.io${path === "/" ? "" : path}`, req.url));
};
