import { Resend } from "resend";

export const resend = () => {
  return new Resend(process.env.RESEND_API_KEY!);
};
