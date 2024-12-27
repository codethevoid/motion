import { TokenClient } from "./client";

const TokenPage = async ({ params }: { params: { identifier: string } }) => {
  const identifier = (await params).identifier;
  return <TokenClient identifier={identifier} />;
};

export default TokenPage;
