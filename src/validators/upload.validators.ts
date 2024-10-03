import { MAX_FILE_SIZE } from "@/lib/constants";
import { z } from "zod";

export const imageUploadSchema = z.object({
  folder: z.string().min(1),
  file: z
    .instanceof(File)
    .refine((data) => data.type.startsWith("image"), {
      message: "Please upload an image",
    })
    .refine((data) => data.size <= MAX_FILE_SIZE, {
      message: `Please upload a file less than ${MAX_FILE_SIZE / 1024 / 1024}MB`,
    }),
});
