import {
  AccountInfoResponse,
  SubmitResponse,
  SubmittableTransaction,
  TxResponse,
  Transaction,
  ServerStateResponse,
  AccountLinesResponse,
  AccountNFTsResponse,
  dropsToXrp,
  AccountTxResponse,
  FeeResponse,
  LedgerCurrentResponse,
  AMMInfoResponse,
} from "xrpl";

const XRPL_HTTP_URL = "https://s1.ripple.com:51234";
// const XRPL_HTTP_URL = "https://s.altnet.rippletest.net:51234";

type XrplRequest = {
  method: string;
  params: Record<string, string | number | boolean | object | undefined>[];
};

const xrplRequest = async (request: XrplRequest) => {
  const response = await fetch(XRPL_HTTP_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to make request to XRPL: ${response.statusText}`);
  }

  const data = await response.json();
  // if (data.result?.error) {
  //   throw new Error(`XRPL error: ${data.result.error}`);
  // }

  return data;
};

export const xrpClient = {
  getAccountInfo: async (address: string): Promise<AccountInfoResponse> => {
    return xrplRequest({
      method: "account_info",
      params: [{ account: address, ledger_index: "validated" }],
    });
  },

  getAccountLines: async (address: string, marker?: string): Promise<AccountLinesResponse> => {
    return xrplRequest({
      method: "account_lines",
      params: [{ account: address, ledger_index: "validated", ...(marker ? { marker } : {}) }],
    });
  },

  getAccountNfts: async (address: string): Promise<AccountNFTsResponse> => {
    return xrplRequest({
      method: "account_nfts",
      params: [{ account: address, ledger_index: "validated" }],
    });
  },

  getServerState: async (): Promise<ServerStateResponse> => {
    return xrplRequest({
      method: "server_state",
      params: [{ ledger_index: "validated" }],
    });
  },

  getLiquidity: async (asset: { currency: string; issuer: string }): Promise<AMMInfoResponse> => {
    return xrplRequest({
      method: "amm_info",
      params: [{ asset: asset, asset2: { currency: "XRP" } }],
    });
  },

  getLedgerTransactions: async (ledgerIndex: number): Promise<AccountTxResponse> => {
    return xrplRequest({
      method: "ledger",
      params: [{ ledger_index: ledgerIndex, transactions: true, expand: true }],
    });
  },

  getTransactions: async (
    address: string,
    limit?: number,
    marker?: string,
  ): Promise<AccountTxResponse> => {
    return xrplRequest({
      method: "account_tx",
      params: [
        {
          account: address,
          binary: false,
          forward: false,
          ledger_index_min: -1,
          ledger_index_max: -1,
          api_version: 2,
          limit: limit || 100,
          ...(marker && { marker }),
        },
      ],
    });
  },

  /**
   * Gets the XRP balance of an adress in drops including the reserves
   * @param address - The address to get the balance of
   */
  getXrpBalance: async (address: string): Promise<number> => {
    const accountInfo: AccountInfoResponse = await xrplRequest({
      method: "account_info",
      params: [{ account: address, ledger_index: "validated" }],
    });

    return Number(accountInfo.result?.account_data?.Balance || 0);
  },

  // Returns the network fee in drops
  getNetworkFee: async (): Promise<number> => {
    const response: FeeResponse = await xrplRequest({ method: "fee", params: [{}] });
    return Number(response.result?.drops?.base_fee || 12); // fallback to 12 drops if no fee is returned
  },

  getSequence: async (address: string): Promise<number> => {
    const response: AccountInfoResponse = await xrplRequest({
      method: "account_info",
      params: [{ account: address, ledger_index: "validated" }],
    });
    return response.result?.account_data?.Sequence;
  },

  getLedgerIndex: async (): Promise<number> => {
    const response: LedgerCurrentResponse = await xrplRequest({
      method: "ledger_current",
      params: [{}],
    });
    return response.result?.ledger_current_index;
  },

  getBalances: async (
    address: string,
  ): Promise<{ issuer: string | undefined; currency: string; value: string }[]> => {
    const accountInfo: AccountInfoResponse = await xrplRequest({
      method: "account_info",
      params: [{ account: address, ledger_index: "validated" }],
    });

    const balances: { issuer: string | undefined; currency: string; value: string }[] = [];

    const xrpBalance = dropsToXrp(accountInfo.result?.account_data?.Balance || 0);
    balances.push({ issuer: undefined, currency: "XRP", value: xrpBalance.toString() });

    const accountLines: AccountLinesResponse = await xrplRequest({
      method: "account_lines",
      params: [{ account: address, ledger_index: "validated" }],
    });

    console.log("accountLines", accountLines?.result?.lines);

    accountLines.result?.lines.forEach((line) => {
      balances.push({ issuer: line.account, currency: line.currency, value: line.balance });
    });

    return balances;
  },

  submit: async (txBlob: SubmittableTransaction | string): Promise<SubmitResponse> => {
    return xrplRequest({ method: "submit", params: [{ tx_blob: txBlob }] });
  },

  submitAndWait: async (
    txBlob: SubmittableTransaction | string,
  ): Promise<TxResponse<Transaction>> => {
    const response: SubmitResponse = await xrplRequest({
      method: "submit",
      params: [{ tx_blob: txBlob }],
    });

    console.log("response", response);

    await new Promise((resolve) => setTimeout(resolve, 3000)); // wait for 5 seconds to confirm the transaction

    const hash = response.result.tx_json.hash;
    const startTime = Date.now();
    const MAX_WAIT_TIME = 25000; // 25 seconds in milliseconds;

    while (true) {
      if (Date.now() - startTime > MAX_WAIT_TIME) {
        throw new Error("Transaction validation timed out");
      }

      const txResponse: TxResponse<Transaction> = await xrplRequest({
        method: "tx",
        params: [{ transaction: hash, binary: false }],
      });

      console.log("txResponse", txResponse);

      if (txResponse.result.validated) return txResponse;
      await new Promise((resolve) => setTimeout(resolve, 1500)); // wait for 1.5 seconds before retrying
    }
  },
};
