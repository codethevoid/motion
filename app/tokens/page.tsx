import { TokensClient } from "./client";
import { constructMetadata } from "@/utils/construct-metadata";

export const metadata = constructMetadata({
  title: "Tokens • TokenOS",
  description:
    "Explore all tokens on the XRP Ledger. View real-time prices, market performance, and recent transactions. Buy, sell, or hold tokens easily while exploring market insights.",
});

const TokensPage = () => {
  return (
    <div className="py-16">
      <TokensClient />
    </div>
  );
};

export default TokensPage;
