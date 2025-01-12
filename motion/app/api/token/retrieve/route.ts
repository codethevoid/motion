import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export const GET = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get("wallet")?.value;
  return NextResponse.json({ token });
};
