"use server";

import { db } from "@/db";
import { products, productSizes } from "@/db/schema";
import { adminProcedure } from "@/lib/actions.procedures";
import { productSchema } from "@/validators/product.validators";
import { createId } from "@paralleldrive/cuid2";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export const createProduct = adminProcedure
  .createServerAction()
  .input(productSchema)
  .handler(async ({ ctx, input }) => {
    const { sizes, ...product } = input;

    const productId = createId();

    await db.insert(products).values({
      id: productId,
      userId: ctx.user.id,
      ...product,
    });

    if (sizes && sizes.length > 0) {
      await db.insert(productSizes).values(
        sizes.map((size) => ({
          productId,
          ...size,
        })),
      );
    }

    if (product.label === "featured" && product.status === "active") {
      revalidateTag("featured-products");
    }

    redirect("/dashboard/products");
  });
