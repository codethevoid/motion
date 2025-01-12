import { Client } from "xrpl";

const XRPL_URL = "wss://xrplcluster.com";

export const getXrpClient = async () => {
  const client = new Client(XRPL_URL);
  await client.connect();
  return client;
};
