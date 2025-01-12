import { jwtVerify, compactDecrypt } from "jose";
import { scryptSync } from "crypto";

const getEncodedSecret = () => {
  const secret = process.env.AUTH_SECRET;
  const encodedSecret = new TextEncoder().encode(secret);
  return encodedSecret;
};

const deriveKey = (password: string, salt: string) => scryptSync(password, salt, 32);

export const decryptToken = async (
  token: string,
  password: string
): Promise<{ privateKey: string; publicKey: string }> => {
  try {
    const encodedSecret = getEncodedSecret();
    const { payload } = await jwtVerify(token, encodedSecret);
    const { jwe, salt } = payload as {
      jwe: string;
      salt: string;
      isCurrent: boolean;
    };
    if (!jwe || !salt) throw new Error("Invalid token");
    const key = deriveKey(password, salt);
    const encodedJwe = new TextEncoder().encode(jwe);
    const { plaintext } = await compactDecrypt(encodedJwe, key);
    const decodedPayload = JSON.parse(new TextDecoder().decode(plaintext));

    return decodedPayload as { privateKey: string; publicKey: string };
  } catch (error) {
    throw new Error("Invalid token or password");
  }
};
