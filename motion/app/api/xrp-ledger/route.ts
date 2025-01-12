import { NextResponse, NextRequest } from "next/server";
import prisma from "@/db/prisma";

export const GET = async (req: NextRequest) => {
  try {
    let host = req.headers.get("host") || "";
    host = host.replace("www.", "").replace("localhost:3000", "motion.zip").toLowerCase();
    console.log(host);

    const data = await prisma.token.findUnique({
      where: { domain: host },
      select: {
        issuer: true,
        currencyHex: true,
        name: true,
        description: true,
        icon: true,
        website: true,
        x: true,
        telegram: true,
      },
    });

    if (!data) {
      return NextResponse.json({ error: "Not Found" }, { status: 404 });
    }

    const toml = `
[[ISSUERS]]
address = "${data.issuer}"

[[TOKENS]]
issuer = "${data.issuer}"
currency = "${data.currencyHex}"
name = "${data.name}"
desc = "${data.description}"
icon = "${data.icon}"

${
  data.website &&
  `[[TOKENS.WEBLINKS]]
url = "${data.website}"
type = "website"
title = "Official website"`
}

${
  data.x &&
  `[[TOKENS.WEBLINKS]]
url = "${data.x}"
type = "socialmedia"
title = "X"`
}

${
  data.telegram &&
  `[[TOKENS.WEBLINKS]]
url = "${data.telegram}"
type = "community"
title = "Telegram"`
}
    `.trim();

    return new NextResponse(toml, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "x-powered-by": "motion.zip",
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }
};
