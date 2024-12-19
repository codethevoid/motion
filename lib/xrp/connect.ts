import { Client } from "xrpl";

const XRPL_URL = "wss://s1.ripple.com:51233";

export const getXrpClient = async () => {
  const client = new Client(XRPL_URL);
  await client.connect();
  return client;
};
