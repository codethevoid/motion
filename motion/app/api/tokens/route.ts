import { NextResponse, NextRequest } from "next/server";

export const GET = async (req: NextRequest) => {
  try {
    const url = req.nextUrl;
    const name = url.searchParams.get("name") || "";
    const page = url.searchParams.get("page") || 0;
    const pageSize = 100;
    const offset = Number(page) * pageSize;

    const searchParams = new URLSearchParams({
      name_like: name,
      offset: offset.toString(),
      include_changes: "true",
      sort_by: "exchanges_7d",
    });

    const res = await fetch(`https://s1.xrplmeta.org/tokens?${searchParams}`);
    console.log(res);
    if (!res.ok) return NextResponse.json({ error: "Error fetching tokens" }, { status: 500 });

    const data = await res.json();
    return NextResponse.json({ tokens: data.tokens, total: data.count });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
};
