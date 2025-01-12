import { NextRequest, NextResponse } from "next/server";

export const xrpLedgerMiddleware = async (req: NextRequest) => {
  let host = req.headers.get("host") || "";
  host = host.replace("www.", "").toLowerCase();
  console.log("host", host);

  if (host === "motion.zip" || host === "localhost:3000") {
    const toml = `
[[ACCOUNTS]]
address = "rQfRb9mGzpvirGaNpLHs2nwXM2vTMzJrU2"
name = "motion.zip"
desc = "Your Gateway to the XRP Ledger"
icon = "https://cdn.motion.zip/logos/motion.png"

[[ACCOUNTS.WEBLINKS]]
url = "https://x.com/motiondotzip"
type = "socialmedia"
title = "X"

[[ACCOUNTS.WEBLINKS]]
url = "https://motion.zip"
type = "info"
title = "Official website"`.trim();

    return new NextResponse(toml, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
        "x-powered-by": "motion.zip",
      },
    });
  }

  // else, request is coming from an unkown subdomain
  // send to api handler to dyanmically create toml file
  return NextResponse.rewrite(new URL(`/api/xrp-ledger`, req.url));
};
