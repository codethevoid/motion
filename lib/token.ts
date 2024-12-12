import { CompactEncrypt, SignJWT, jwtVerify, compactDecrypt } from "jose";
import crypto from "crypto";
import { cookies } from "next/headers";
import { rootDomain } from "@/utils";

// our app auth secret
const secret = process.env.AUTH_SECRET;
const encodedSecret = new TextEncoder().encode(secret);

// derive a 256 bit key from the password (32 bytes)
const deriveKey = (password: string, salt: string) => crypto.scryptSync(password, salt, 32);
const generateSalt = () => crypto.randomBytes(16).toString("hex");

type TokenPayload = {
  seed: string;
};

export const issueToken = async (payload: TokenPayload, address: string, password: string) => {
  if (!password) throw new Error("Password is required");
  if (!payload) throw new Error("Payload is required");

  // encrypt payload with password
  const salt = generateSalt();
  const key = deriveKey(password, salt);

  const encodedPayload = new TextEncoder().encode(JSON.stringify(payload));
  const jwe = await new CompactEncrypt(encodedPayload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .encrypt(key);

  // sign jwe with our secret to verify integrity
  const signedToken = await new SignJWT({ jwe, salt, address, isCurrent: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(encodedSecret);

  return signedToken;
};

// decrypt token with user provided password and return the payload (seed)
// can only do this when the user has provided a password
export const decryptToken = async (token: string, password: string) => {
  const { payload } = await jwtVerify(token, encodedSecret);
  const { jwe, salt, isCurrent } = payload as { jwe: string; salt: string; isCurrent: boolean };
  if (!jwe || !salt) throw new Error("Invalid token");

  const key = deriveKey(password, salt);
  const encodedJwe = new TextEncoder().encode(jwe);
  const { plaintext } = await compactDecrypt(encodedJwe, key);
  const decodedPayload = JSON.parse(new TextDecoder().decode(plaintext));

  return decodedPayload;
};

export const setCookie = async (token: string) => {
  const cookiesStore = await cookies();
  cookiesStore.set("wallet", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30), // 30 days
    domain: process.env.NODE_ENV === "production" ? `.${rootDomain}` : undefined,
  });
};

export const getWallet = async (token: string) => {
  const { payload } = await jwtVerify(token, encodedSecret);
  const { address, salt, isCurrent } = payload as {
    address: string;
    salt: string;
    isCurrent: boolean;
  };
  return { address, salt, isCurrent };
};
