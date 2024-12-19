import { ReactNode } from "react";
import { WalletAuth } from "./auth";

const WalletLayout = ({ children }: { children: ReactNode }) => {
  return (
    <WalletAuth>
      <div className="space-y-3">{children}</div>
    </WalletAuth>
  );
};

export default WalletLayout;
