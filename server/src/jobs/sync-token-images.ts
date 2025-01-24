import { s3 } from "../utils/s3.js";
import { xrplMeta } from "../lib/xrpl-meta.js";
import { HeadObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";

let isSyncing = false;

export const syncTokenImages = async () => {
  if (isSyncing) return;
  isSyncing = true;
  console.log("Syncing token images...");

  try {
    const response = await xrplMeta.request({
      command: "tokens",
      sort_by: "exchanges_7d",
      limit: 1000,
    });

    console.log(`Syncing ${response.result?.tokens?.length} token images`);

    const tokens = response.result?.tokens || [];
    let count = 0;

    for (const token of tokens) {
      const { currency, issuer } = token;
      const { icon } = token?.meta?.token;

      if (!icon) {
        console.log(`No icon found for ${currency}`);
        count++;
        continue;
      }

      const url = icon.replace("s2", "s1");
      const key = `icons/${currency}/${issuer}`;

      // check if the image exists in s3
      try {
        await s3().send(
          new HeadObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: key,
          }),
        );
        console.log(`Image already exists for ${key}`);
        count++;
        continue;
      } catch (e) {
        // image does not exist
      }

      // get image from url
      const response = await fetch(url);
      if (!response.ok) continue;

      const buffer = await response.arrayBuffer();

      // upload to s3
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: "image/png",
      };

      await s3().send(new PutObjectCommand(params));
      console.log(
        `Uploaded token ${count} of ${tokens.length} (${((count / tokens.length) * 100).toFixed(2)}%)`,
      );
      count++;
    }
  } catch (e) {
    console.error(`Error syncing token images: ${e}`);
  } finally {
    isSyncing = false;
    console.log("Syncing token images complete");
  }
};
