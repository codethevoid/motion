import prisma from "@/db/prisma";
import { constructMetadata } from "@/utils/construct-metadata";
import { Metadata } from "next";
import { redirect } from "next/navigation";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const generateMetadata = async ({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> => {
  const search = await searchParams;
  const ref = search.ref;
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

const ProxyPage = async ({ searchParams }: { searchParams: SearchParams }) => {
  const search = await searchParams;
  const ref = search.ref;
  if (!ref) return redirect("/");

  const referrer = await prisma.wallet.findUnique({
    where: { referralKey: ref as string },
    select: { id: true },
  });
  console.log("referrer", referrer);
  if (!referrer) return redirect("/");

  return <div>serving metadata to bots...</div>;
};

export default ProxyPage;
