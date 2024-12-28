import { cookies } from "next/headers";

export const updateCookie = async (token: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set("wallet", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
  });
};
