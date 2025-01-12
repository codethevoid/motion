import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
export const nanoid = (length = 4) => {
  const generate = customAlphabet(alphabet, length);
  return generate();
};
