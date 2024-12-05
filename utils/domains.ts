const environment = process.env.NODE_ENV;

export const rootDomain = environment === "development" ? "localhost:3000" : "davincii.io";
export const appDomain = environment === "development" ? "app.localhost:3000" : "app.davincii.io";
export const protocol = environment === "development" ? "http://" : "https://";
