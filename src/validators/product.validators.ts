import { productLabelEnum, productStatusEnum } from "@/db/schema";
import { CATEGORIES, MAX_PRODUCT_IMAGES } from "@/lib/constants";
import { z } from "zod";

function numberWithNaNCheck(val: unknown) {
  const num =
    typeof val === "number"
      ? val
      : typeof val === "string"
        ? Number(val)
        : undefined;
  return typeof num === "number" && !isNaN(num) ? num : undefined;
}

const sizeSchema = z
  .object({
    value: z.preprocess(
      numberWithNaNCheck,
      z
        .number({
          required_error: "Size is required",
          invalid_type_error: "Invalid size",
        })
        .int("Invalid size")
        .min(1, "Size must be greater than 1 ml"),
    ),
    price: z.preprocess(
      numberWithNaNCheck,
      z
        .number({
          required_error: "Price is required",
          invalid_type_error: "Invalid price",
        })
        .min(0, "Price must be greater than 0")
        .transform(String),
    ),
    salePrice: z.preprocess(
      numberWithNaNCheck,
      z
        .number({ invalid_type_error: "Invalid sale price" })
        .min(0, "Sale price must be greater than 0")
        .nullish()
        .transform((val) => (val ? String(val) : null)),
    ),
    stock: z.preprocess(
      numberWithNaNCheck,
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
      data.salePrice ? Number(data.price) >= Number(data.salePrice) : true,
    {
      message: "Sale price must be less than or equal to price",
      path: ["salePrice"],
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
    .min(1, "Please add at least one tag"),
  status: z.enum(productStatusEnum.enumValues, {
    required_error: "Please select product status",
  }),
  label: z.enum(productLabelEnum.enumValues, {
    required_error: "Please select product label",
  }),
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

export const cartItemsSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1).cuid2(),
        sizeId: z.string().min(1).cuid2(),
        qty: z.number().int().min(1),
        isSelected: z.boolean(),
      }),
    )
    .min(1, "Please add at least one item"),
});

export type CartItemsSchema = z.infer<typeof cartItemsSchema>;
export type CartItem = CartItemsSchema["items"][number];
