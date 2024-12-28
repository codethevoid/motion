import { TokenClient } from "./client";

const TokenPage = async ({ params }: { params: Promise<Record<string, string>> }) => {
  const awaitedParams = await params;
  const identifier = awaitedParams.identifier;
  return <TokenClient identifier={identifier} />;
};

export default TokenPage;
