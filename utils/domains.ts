const environment = process.env.NODE_ENV;

export const rootDomain = environment === "development" ? "localhost:3000" : "davincii.io";
export const appDomain =
  environment === "development" ? "wallet.localhost:3000" : "wallet.davincii.io";
export const protocol = environment === "development" ? "http://" : "https://";
