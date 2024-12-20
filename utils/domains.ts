const environment = process.env.NODE_ENV;

export const rootDomain = environment === "development" ? "localhost:3000" : "tokenos.one";
export const appDomain =
  environment === "development" ? "wallet.localhost:3000" : "wallet.tokenos.one";
export const protocol = environment === "development" ? "http://" : "https://";
