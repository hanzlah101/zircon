import { z } from "zod";
import { isCuid } from "@paralleldrive/cuid2";

export const idSchema = z.object({
  id: z.string().min(1).refine(isCuid),
});

export const idsSchema = z.object({
  ids: z.array(idSchema.shape.id).min(1),
});

export const searchParamsSchema = z.object({
  page: z.coerce.number().int().default(1),
  per_page: z.coerce.number().int().max(50).default(10),
  sort: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  operator: z.enum(["and", "or"]).optional(),
  q: z
    .string()
    .optional()
    .transform((v) => v?.trim()),
});
