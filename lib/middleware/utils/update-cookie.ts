import { cookies } from "next/headers";
import { rootDomain } from "@/utils";

export const updateCookie = async (token: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set("wallet", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
  });
};
