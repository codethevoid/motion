"use client";

import { TokenSchema } from "@motion/shared/zod";
import { createContext, useContext, useState, ReactNode } from "react";
import { Amount } from "xrpl";
import { useSession } from "@/hooks/use-session";

// This state is used to control the wallet popover
// we are making this a context because we want to be able to access
// the state when trading in the dex

export type Transaction = {
  type: "sell" | "buy"; // if the user is receiving XRP, they are selling their custom tokens, oherwise they are buying because XRP is the native currency
  amountToDeliver: Amount;
  amountToReceive: Amount;
  slippage: number;
  fee: string; // just to show the fee in the UI, we will recalculate it when confirming the transaction
};

export type Payload = TokenSchema;

type WalletState = {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  transaction: Transaction | null;
  setTransaction: (transaction: Transaction | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  password: string;
  setPassword: (password: string) => void;
  payload: Payload;
  setPayload: (payload: Payload) => void;
  jwe: string | undefined;
};

export const WalletContext = createContext<WalletState | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [payload, setPayload] = useState<Payload>({} as Payload);
  const { jwe } = useSession();

  return (
    <WalletContext.Provider
      value={{
        isOpen,
        setIsOpen,
        transaction,
        setTransaction,
        isLoading,
        setIsLoading,
        password,
        setPassword,
        payload,
        setPayload,
        jwe,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWalletActions = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWalletActions must be used within a WalletProvider");
  }
  return context;
};
