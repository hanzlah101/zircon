"use server";

import { db } from "@/db";
import { products, productSizes } from "@/db/schema";
import { adminProcedure } from "@/lib/actions.procedures";
import { createId } from "@paralleldrive/cuid2";
import { revalidatePath, revalidateTag } from "next/cache";
import { eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import {
  productSchema,
  updateProductSchema,
} from "@/validators/product.validators";
import { idsSchema } from "@/validators/common.validators";

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

    revalidatePath("/dashboard/products");

    if (product.label === "featured" && product.status === "active") {
      revalidateTag("featured-products");
    }

    redirect("/dashboard/products");
  });

export const updateProduct = adminProcedure
  .createServerAction()
  .input(updateProductSchema)
  .handler(async ({ input }) => {
    const { sizes, id, shouldRedirect = true, ...product } = input;

    await db.transaction(async (tx) => {
      if (Object.keys(product).length > 0) {
        await tx.update(products).set(product).where(eq(products.id, id));
      }

      if (sizes && sizes.length > 0) {
        const existingSizes = await tx
          .select({ id: productSizes.id })
          .from(productSizes)
          .where(eq(productSizes.productId, id));

        const sizesToCreate = sizes.filter((size) => !size.id);
        const sizesToUpdate = sizes.filter((size) => size.id);
        const sizesToDelete = existingSizes.filter(
          (size) => !sizes.find((s) => s.id === size.id),
        );

        if (sizesToCreate.length > 0) {
          await tx
            .insert(productSizes)
            .values(sizesToCreate.map((size) => ({ ...size, productId: id })));
        }

        for (const size of sizesToUpdate) {
          await tx
            .update(productSizes)
            .set(size)
            .where(eq(productSizes.id, size.id!));
        }

        if (sizesToDelete.length > 0) {
          await tx.delete(productSizes).where(
            inArray(
              productSizes.id,
              sizesToDelete.map((size) => size.id),
            ),
          );
        }
      }
    });

    revalidatePath(`/dashboard/products/edit/${id}`);
    revalidateTag("featured-products");
    revalidatePath("/dashboard/products");

    if (shouldRedirect === true) {
      redirect("/dashboard/products");
    }
  });

export const updateProducts = adminProcedure
  .createServerAction()
  .input(idsSchema.and(updateProductSchema.pick({ status: true, label: true })))
  .handler(async ({ input }) => {
    const { ids, ...data } = input;

    await db.update(products).set(data).where(inArray(products.id, ids));

    revalidateTag("featured-products");
    revalidatePath("/dashboard/products");
  });

export const deleteProducts = adminProcedure
  .createServerAction()
  .input(idsSchema)
  .handler(async ({ input }) => {
    await db
      .update(products)
      .set({ isDeleted: true })
      .where(inArray(products.id, input.ids));

    revalidateTag("featured-products");
    revalidatePath("/dashboard/products");
  });
