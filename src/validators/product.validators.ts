import { z } from "zod";
import { productLabelEnum, productStatusEnum } from "@/db/schema";
import { CATEGORIES, MAX_PRODUCT_IMAGES } from "@/lib/constants";
import { searchParamsSchema } from "./common.validators";

function safeParseNumber(value: unknown): number | undefined {
  if (typeof value === "number" && !isNaN(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return !isNaN(parsed) ? parsed : undefined;
  }
  return undefined;
}

const sizeSchema = z
  .object({
    id: z.string().cuid2().optional(),
    value: z.preprocess(
      safeParseNumber,
      z
        .number({
          required_error: "Size is required",
          invalid_type_error: "Invalid size",
        })
        .int("Invalid size")
        .min(1, "Size must be greater than 1 ml"),
    ),
    price: z.preprocess(
      safeParseNumber,
      z
        .number({
          required_error: "Price is required",
          invalid_type_error: "Invalid price",
        })
        .min(0, "Price must be greater than 0")
        .transform(String),
    ),
    compareAtPrice: z.preprocess(
      safeParseNumber,
      z
        .number({ invalid_type_error: "Invalid price" })
        .min(0, "Compare at price must be greater than 0")
        .nullish()
        .transform((val) => (val ? String(val) : null)),
    ),
    stock: z.preprocess(
      safeParseNumber,
      z
        .number({
          required_error: "Stock is required",
          invalid_type_error: "Invalid stock",
        })
        .int("Invalid stock")
        .min(0, "Stock must be greater than 0"),
    ),
  })
  .refine(
    (data) =>
      data.compareAtPrice
        ? Number(data.compareAtPrice) > Number(data.price)
        : true,
    {
      message: "Compare at price must be greater than actual price",
      path: ["compareAtPrice"],
    },
  );

export const productSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters"),
  description: z.string().optional(),
  notes: z.string().optional(),
  category: z.enum(CATEGORIES, {
    required_error: "Please select a category",
  }),
  tags: z
    .array(
      z
        .string({ required_error: "Please add a tag" })
        .min(1, "Please add at least one tag")
        .max(96, "Please add at most 96 characters"),
    )
    .min(1, "Please add at least one tag")
    .max(10, "Can't select more than 10 tags"),
  status: z
    .enum(productStatusEnum.enumValues, {
      required_error: "Please select product status",
    })
    .default("draft"),
  label: z
    .enum(productLabelEnum.enumValues, {
      required_error: "Please select product label",
    })
    .default("none"),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        key: z.string().min(1),
        name: z.string().min(1),
        order: z.coerce.number().min(0).int(),
      }),
    )
    .min(2, "Select at least two images")
    .max(
      MAX_PRODUCT_IMAGES,
      `Can't select more than ${MAX_PRODUCT_IMAGES} images`,
    ),
  sizes: z.array(sizeSchema).min(1, "Please add at least one size"),
});

export type ProductSchema = z.infer<typeof productSchema>;

export const updateProductSchema = z.object({
  id: z.string().min(1).cuid2(),
  title: z
    .string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .optional(),
  description: z.string().optional(),
  notes: z.string().optional(),
  category: z
    .enum(CATEGORIES, {
      invalid_type_error: "Invalid category",
    })
    .optional(),
  tags: z
    .array(
      z
        .string({ invalid_type_error: "Invalid tag" })
        .min(1, "Tag must not be empty")
        .max(96, "Tag must be at most 96 characters"),
    )
    .min(1, "Please add at least one tag")
    .max(10, "Can't select more than 10 tags")
    .optional(),
  status: z
    .enum(productStatusEnum.enumValues, {
      invalid_type_error: "Invalid product status",
    })
    .optional(),
  label: z
    .enum(productLabelEnum.enumValues, {
      invalid_type_error: "Invalid product label",
    })
    .optional(),
  images: z
    .array(
      z.object({
        url: z.string().min(1),
        key: z.string().min(1),
        name: z.string().min(1),
        order: z.coerce.number().min(0).int(),
      }),
    )
    .min(2, "Select at least two images")
    .max(
      MAX_PRODUCT_IMAGES,
      `Can't select more than ${MAX_PRODUCT_IMAGES} images`,
    )
    .optional(),
  sizes: z.array(sizeSchema).min(1, "Please add at least one size").optional(),
  shouldRedirect: z.boolean().default(true).optional(),
});

export type UpdateProductSchema = z.infer<typeof updateProductSchema>;

export const cartItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).cuid2(),
        sizeId: z.string().min(1).cuid2(),
        qty: z.coerce.number().int().min(1).default(1),
      }),
    )
    .min(1, "Please add at least one item"),
});

export type CartItemsSchema = z.infer<typeof cartItemsSchema>;
export type CartItem = CartItemsSchema["items"][number];

export const getDashboardProductsSchema = searchParamsSchema.extend({
  category: z.string().optional(),
  status: z.string().optional(),
  label: z.string().optional(),
});

export type GetDashboardProductsSchema = z.infer<
  typeof getDashboardProductsSchema
>;
