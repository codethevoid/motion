import xrpl from "xrpl";

// const XRPL_URL =
//   process.env.NODE_ENV === "production"
//     ? "wss://s1.ripple.com:51233"
//     : "wss://s.altnet.rippletest.net:51233";

export const XRPL_URL = "wss://s1.ripple.com:51233";

// const getXrpClient = async () => {
//   const client = new xrpl.Client(XRPL_URL);
//   await client.connect();
//   return client;
// };

// const xrplClient = getXrpClient();
// export default xrplClient;

const xrplClient = new xrpl.Client(XRPL_URL);
xrplClient.connect();
export default xrplClient;

// const xrplClientSingleton = () => {
//   const client = new xrpl.Client(XRPL_URL);
//   client.connect();
//   console.log("XRPL Client initialized and connected.");
//   return client;
// };

// // Extend the global object to include the XRPL client
// declare const globalThis: {
//   xrplGlobal: xrpl.Client | undefined;
// } & typeof global;

// const xrplClient = globalThis.xrplGlobal ?? xrplClientSingleton();

// // Export the singleton instance
// export default xrplClient;

// // Ensure the client is reused during development
// if (process.env.NODE_ENV !== "production") globalThis.xrplGlobal = xrplClient;
