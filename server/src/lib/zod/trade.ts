import { z } from "zod";

const issuedTokenSchema = z.object({
  currency: z.string().refine((currency) => {
    if (/^[A-Z0-9]{3}$/.test(currency)) return true;
    if (/^[A-F0-9]{40}$/i.test(currency)) return true;
    return false;
  }),
  issuer: z.string(),
  value: z.string().refine((value) => {
    return !isNaN(Number(value)) && Number(value) > 0;
  }),
});

const xrpSchema = z.string().refine((value) => {
  return !isNaN(Number(value)) && Number(value) > 0;
});

export const tradeSchema = z.object({
  transaction: z
    .object({
      type: z.enum(["buy", "sell"]),
      amountToDeliver: z.union([xrpSchema, issuedTokenSchema]),
      amountToReceive: z.union([xrpSchema, issuedTokenSchema]),
      slippage: z.number().min(1).max(50),
    })
    .refine(
      (data) => {
        const isDeliverString = typeof data.amountToDeliver === "string";
        const isReceiveString = typeof data.amountToReceive === "string";
        return isDeliverString !== isReceiveString;
      },
      { message: "Either amountToDeliver or amountToReceive must be a string (XRP)" },
    ),
});
