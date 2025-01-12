import { Client } from "xrpl";

const url = "wss://xrplcluster.com";

class XrpClientService {
  private static instance: XrpClientService;
  private client: Client;
  private isConnecting: boolean = false;

  private constructor() {
    this.client = new Client(url);
  }

  static getInstance(): XrpClientService {
    if (!XrpClientService.instance) {
      XrpClientService.instance = new XrpClientService();
    }
    return XrpClientService.instance;
  }

  async connect(): Promise<Client> {
    if (!this.client.isConnected() && !this.isConnecting) {
      this.isConnecting = true;
      await this.client.connect();
      this.isConnecting = false;
    }

    return this.client;
  }

  async disconnect(): Promise<void> {
    if (this.client.isConnected()) {
      await this.client.disconnect();
    }
  }
}

export const xrplClient = XrpClientService.getInstance();
