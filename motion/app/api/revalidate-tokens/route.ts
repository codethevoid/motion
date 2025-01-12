import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const key = authHeader.split(" ")[1];
  if (key !== process.env.REVALIDATION_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // allow revalidation
  revalidateTag("tokens");
  return NextResponse.json({ success: true });
};
