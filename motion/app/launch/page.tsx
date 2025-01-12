import { LaunchClient } from "./client";
import { constructMetadata } from "@/utils/construct-metadata";

export const metadata = constructMetadata({
  title: "Launch Your Token • motion.zip",
  description:
    "Create and launch your own token on the XRPL in minutes. Perfect for meme coins, utility tokens, or any other use case. Set custom allocations, configure liquidity pools, and start building your community on motion.zip.",
});

const LaunchPage = () => {
  return <LaunchClient />;
};

export default LaunchPage;
