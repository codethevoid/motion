import { z } from "zod";

const optionalUrl = () =>
  z
    .string()
    .transform((url) => (url ? url : undefined))
    .pipe(z.string().url({ message: "Enter a valid url" }).optional());

export type FileInfo = {
  lastModified: number;
  name: string;
  size: number;
  type: string;
};

export const tokenSchema = z.object({
  name: z
    .string()
    .min(1, { message: "Enter a name for your token" })
    .max(60, { message: "Name cannot be more than 60 characters" })
    .describe("The name of the token"),
  ticker: z
    .string()
    .min(1, { message: "Enter a ticker for your token" })
    .min(3, { message: "Ticker must be at least 3 characters" })
    .max(40, { message: "Ticker cannot be more than 40 characters" })
    .describe("The ticker of the token, e.g 'XRP'"),
  description: z
    .string()
    .min(1, { message: "Enter a description for your token" })
    .max(180, { message: "Description cannot be more than 180 characters" }),
  icon: z.union(
    [
      z.instanceof(File, { message: "Select an icon for your token" }),
      z.custom<FileInfo>(
        (data) =>
          data &&
          "lastModified" in data &&
          "name" in data &&
          "size" in data &&
          "type" in data
      ),
    ],
    { message: "Select an icon for your token" }
  ),
  banner: z.union(
    [
      z.instanceof(File, { message: "Select a banner for your token" }),
      z.custom<FileInfo>(
        (data) =>
          data &&
          "lastModified" in data &&
          "name" in data &&
          "size" in data &&
          "type" in data
      ),
    ],
    { message: "Select a banner for your token" }
  ),
  website: optionalUrl(),
  x: optionalUrl(),
  telegram: optionalUrl(),
  supply: z
    .number({ message: "Enter a supply for your token" })
    .min(10_000, { message: "Supply must be at least 10,000" })
    .max(1_000_000_000_000, {
      message: "Supply cannot be more than 1,000,000,000,000",
    })
    .describe("The total supply of the token"),
  devAllocation: z
    .number({ message: "Enter a dev allocation for your token" })
    .min(0, { message: "Dev allocation cannot be less than 0" })
    .max(50, { message: "Dev allocation cannot be more than 50%" })
    .describe(
      "The percentage of the total supply that will be allocated to the dev"
    ),
  poolAmount: z
    .number({ message: "Enter the amount of XRP LP" })
    .min(1, { message: "Amount must be at least 1 XRP" })
    .describe("The amount of XRP to be provided for the initial liquidity"),
  poolFee: z
    .number({ message: "Enter a pool fee for your token" })
    .min(0, { message: "Pool fee cannot be less than 0%" })
    .max(1, { message: "Pool fee cannot be more than 1%" })
    .describe("The initial AMM fee for the token liquidity pool"),
});

export type TokenSchema = z.infer<typeof tokenSchema>;
