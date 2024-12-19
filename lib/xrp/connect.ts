import { Client } from "xrpl";

const XRPL_URL = "wss://s1.ripple.com:51233";

export const getXrpClient = async () => {
  const client = new Client(XRPL_URL);
  try {
    if (!client.isConnected()) {
      await client.connect();
    }
    return client;
  } catch (error) {
    // Clean up if connection fails
    try {
      await client.disconnect();
    } catch (disconnectError) {
      console.error("Error disconnecting after failed connection:", disconnectError);
    }
    throw error;
  }
};
