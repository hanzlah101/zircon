"use server";

import { env } from "@/env";
import { authProcedure } from "@/lib/actions.procedures";
import { imageUploadSchema } from "@/validators/upload.validators";
import { createId } from "@paralleldrive/cuid2";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3Client = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const uploadImage = authProcedure
  .createServerAction()
  .input(imageUploadSchema, { type: "formData" })
  .handler(async ({ input }) => {
    const { file, folder } = input;

    const key = `${folder}/${Date.now()}-${createId()}-${file.name}`;

    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      ContentType: file.type,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    const url = `https://pub-1aac253ebb2f44f2be04a29a1d601e7e.r2.dev/${key}`;

    return { presignedUrl, key, url };
  });
