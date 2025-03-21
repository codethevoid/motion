import { NextResponse } from "next/server";
import { withWallet } from "@/lib/auth/with-wallet";
import prisma from "@/db/prisma";
import { s3 } from "@/utils/s3";
import { nanoid } from "@/utils/alphabet";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { defaultMetadata } from "@/utils/construct-metadata";

export const POST = withWallet(async ({ req, wallet }) => {
  try {
    const { title, image, imgType, slug } = await req.json();

    // Add URL-safe slug validation
    if (slug?.trim() && !/^[a-zA-Z0-9-_]+$/.test(slug.trim())) {
      return NextResponse.json(
        { error: "Slug can only contain letters, numbers, hyphens and underscores" },
        { status: 400 },
      );
    }

    if (title && typeof title !== "string") {
      return NextResponse.json({ error: "Title must be a string" }, { status: 400 });
    }

    if (slug?.trim().length > 50) {
      return NextResponse.json({ error: "Slug must be less than 50 characters" }, { status: 400 });
    }

    if (title?.length > 100) {
      // check length of title
      return NextResponse.json(
        { error: "Title must be less than 100 characters" },
        { status: 400 },
      );
    }

    if (image && typeof image !== "string") {
      return NextResponse.json({ error: "Image must be a string" }, { status: 400 });
    }

    // get existing image from db
    // so if user is only updating title, we don't overwrite the image with no image
    const existingData = await prisma.wallet.findUnique({
      where: { address: wallet.address },
      select: { referralImage: true, referralKey: true },
    });

    if (!existingData) {
      return NextResponse.json({ error: "Failed to update referral link" }, { status: 400 });
    }

    // upload image to s3 if it exists
    // set location to existing image if no image is provided so we don't overwrite the image with no image
    let location = existingData?.referralImage || null;
    if (image) {
      // Remove the data URL prefix if it exists
      const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

      // Check file size (base64 string length * 0.75 gives approximate size in bytes)
      const fileSizeInBytes = Math.ceil((base64Data.length * 3) / 4);
      const fileSizeInMB = fileSizeInBytes / (1024 * 1024);

      if (fileSizeInMB > 10) {
        return NextResponse.json({ error: "Image must be less than 10MB" }, { status: 400 });
      }

      // get buffer from base64
      const buffer = Buffer.from(base64Data, "base64");
      const params = {
        Bucket: process.env.AWS_BUCKET_NAME!,
        Key: `affiliate/${wallet.address}/${nanoid(10)}`,
        Body: buffer,
        ContentType: imgType,
      };

      try {
        const command = new PutObjectCommand(params);
        await s3.send(command);
        location = `https://cdn.motion.zip/${params.Key}`;
      } catch (e) {
        console.error(e);
      }
    }

    if (slug?.trim() !== existingData?.referralKey && slug?.trim() !== "") {
      // check if slug is already taken
      const existingSlug = await prisma.wallet.findUnique({
        where: { referralKey: slug?.trim() },
      });
      if (existingSlug) {
        return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
      }
    }

    await prisma.wallet.update({
      where: { address: wallet.address },
      data: {
        referralTitle: title?.trim() === defaultMetadata.title ? null : title?.trim() || null,
        referralImage: location,
        referralKey: slug?.trim() || existingData?.referralKey,
      },
    });

    return NextResponse.json({});
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to update referral link" }, { status: 500 });
  }
});
