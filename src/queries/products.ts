import "server-only";

import { unstable_cache as cache } from "next/cache";
import { and, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { products, productSizes, type ProductSize } from "@/db/schema";
import type { CartItem } from "@/validators/product.validators";

export async function getFeaturedProducts() {
  async function fetchProducts() {
    return db
      .select({
        id: products.id,
        title: products.title,
        images: products.images,
        rating: products.rating,
        sizes: sql<ProductSize[]>`json_agg(${productSizes})`.as("sizes"),
      })
      .from(products)
      .innerJoin(productSizes, eq(products.id, productSizes.productId))
      .where(and(eq(products.label, "featured"), eq(products.status, "active")))
      .groupBy(products.id)
      .orderBy(desc(products.createdAt))
      .limit(8);
  }

  const cachedProducts = cache(fetchProducts, ["featured-products"], {
    revalidate: 60 * 60 * 24 * 7, // every week
    tags: ["featured-products"],
  });

  return cachedProducts();
}

export async function getProduct(productId: string) {
  try {
    const [product] = await db
      .select({
        id: products.id,
        title: products.title,
        description: products.description,
        notes: products.notes,
        category: products.category,
        images: products.images,
        rating: products.rating,
        sizes: sql<ProductSize[]>`json_agg(${productSizes})`.as("sizes"),
      })
      .from(products)
      .innerJoin(productSizes, eq(products.id, productSizes.productId))
      .where(
        and(
          eq(products.id, productId),
          eq(products.status, "active"),
          eq(products.label, "featured"),
        ),
      )
      .groupBy(products.id);

    return product;
  } catch {
    return null;
  }
}

export async function getCartProducts(cartItems: CartItem[]) {
  const productIds = cartItems.map((item) => item.productId);
  const sizeIds = cartItems.map((item) => item.sizeId);

  const cartProducts = await db
    .select({
      id: products.id,
      title: products.title,
      images: products.images,
      size: productSizes,
    })
    .from(products)
    .innerJoin(
      productSizes,
      and(
        eq(products.id, productSizes.productId),
        inArray(productSizes.id, sizeIds),
      ),
    )
    .where(
      and(inArray(products.id, productIds), eq(products.status, "active")),
    );

  return cartProducts;
}
