import prisma from "@/db/prisma";
import { constructMetadata } from "@/utils/construct-metadata";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type Params = Promise<{ ref: string }>;

export const generateMetadata = async ({ params }: { params: Params }): Promise<Metadata> => {
  const awaitedParams = await params;
  const ref = awaitedParams.ref;
  if (!ref) return constructMetadata({}); // no referrer, just stick with the default metadata for the app

  const referrer = await prisma.wallet.findUnique({
    where: { referralKey: ref as string },
    select: { referralImage: true, referralTitle: true },
  });
  if (!referrer) return constructMetadata({}); // no referrer, just stick with the default metadata for the app

  const { referralTitle, referralImage } = referrer;
  console.log("referrer", referrer);
  return constructMetadata({
    ...(referralTitle && { title: referralTitle }),
    ...(referralImage && { image: referralImage }),
    noIndex: true,
  });
};

const ProxyPage = async ({ params }: { params: Params }) => {
  const awaitedParams = await params;
  const ref = awaitedParams.ref;
  if (!ref) {
    return redirect(
      process.env.NODE_ENV === "production" ? "https://tokenos.one" : "localhost:3000",
    );
  }

  const referrer = await prisma.wallet.findUnique({
    where: { referralKey: ref as string },
    select: { id: true },
  });
  console.log("referrer", referrer);
  if (!referrer) {
    return redirect(
      process.env.NODE_ENV === "production" ? "https://tokenos.one" : "localhost:3000",
    );
  }

  return <div>serving metadata to bots...</div>;
};

export default ProxyPage;
