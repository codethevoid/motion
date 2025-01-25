import WebSocket from "ws";

const url = "wss://s1.xrplmeta.org";

class XrplMetaService {
  private static instance: XrplMetaService;
  private ws: WebSocket | null = null;
  private isConnecting: boolean = false;
  private connectPromise: Promise<WebSocket> | null = null;
  private requestId: number = 0;
  private pendingRequests: Map<number, { resolve: Function; reject: Function }> = new Map();
  private pingInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): XrplMetaService {
    if (!XrplMetaService.instance) {
      XrplMetaService.instance = new XrplMetaService();
    }
    return XrplMetaService.instance;
  }

  async connect(): Promise<WebSocket> {
    if (this.isConnected()) {
      return this.ws!;
    }

    if (this.isConnecting) {
      return this.connectPromise!;
    }

    this.isConnecting = true;

    this.connectPromise = new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);

      this.ws.once("open", () => {
        this.isConnecting = false;
        this.startPingInterval();
        resolve(this.ws!);
      });

      this.ws.once("error", (err) => {
        this.isConnecting = false;
        this.ws = null;
        this.connectPromise = null;
        reject(err);
      });

      this.ws.on("close", () => {
        this.ws = null;
        this.isConnecting = false;
        this.connectPromise = null;
      });
    });

    return this.connectPromise;
  }

  async disconnect(): Promise<void> {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }

    if (this.isConnected()) {
      this.ws!.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  async request(payload: any): Promise<any> {
    try {
      await this.connect();

      if (!this.isConnected()) {
        throw new Error("WebSocket is not connected");
      }

      // Add request ID to payload
      const id = ++this.requestId;
      const requestPayload = { ...payload, id };

      return new Promise((resolve, reject) => {
        // Store the promise handlers
        this.pendingRequests.set(id, { resolve, reject });

        // Set a timeout to clean up hanging requests
        const timeout = setTimeout(() => {
          const handlers = this.pendingRequests.get(id);
          if (handlers) {
            this.pendingRequests.delete(id);
            handlers.reject(new Error("Request timeout"));
          }
        }, 10000); // 10 second timeout

        // Send the request
        this.ws!.send(JSON.stringify(requestPayload));

        // Add message handler if not already added
        if (this.ws!.listenerCount("message") === 0) {
          this.ws!.on("message", (data: WebSocket.Data) => {
            try {
              const response = JSON.parse(data.toString());
              const handlers = this.pendingRequests.get(response.id);

              if (handlers) {
                clearTimeout(timeout);
                this.pendingRequests.delete(response.id);
                handlers.resolve(response);
              }
            } catch (error) {
              console.error("Error handling WebSocket message:", error);
            }
          });
        }
      });
    } catch (error) {
      throw error;
    }
  }

  private startPingInterval(): void {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.isConnected()) {
        this.request({ command: "ping" }).catch((err) => {
          console.error("Ping failed:", err);
        });
      }
    }, 30000);
  }
}

export const xrplMeta = XrplMetaService.getInstance();
