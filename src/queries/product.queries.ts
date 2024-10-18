import "server-only";

import { db } from "@/db";
import {
  unstable_cache as cache,
  unstable_noStore as noStore,
} from "next/cache";

import {
  and,
  arrayContains,
  asc,
  count,
  desc,
  eq,
  gte,
  inArray,
  lte,
  not,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import {
  products,
  productSizes,
  type ProductSize,
  type Product,
} from "@/db/schema";

import type {
  CartItem,
  GetDashboardProductsSchema,
} from "@/validators/product.validators";
import { filterColumn } from "@/lib/filter-column";
import { DrizzleWhere } from "@/lib/types";

export async function getFeaturedProducts() {
  async function fetchProducts() {
    return db
      .select({
        id: products.id,
        title: products.title,
        images: products.images,
        rating: products.rating,
        sizes: sql<ProductSize[]>`
          json_agg(
            json_build_object(
              'id', ${productSizes.id},
              'productId', ${productSizes.productId},
              'value', ${productSizes.value},
              'price', ${productSizes.price},
              'stock', ${productSizes.stock},
              'compareAtPrice', ${productSizes.compareAtPrice}
            )
          )
        `.as("sizes"),
      })
      .from(products)
      .innerJoin(productSizes, eq(products.id, productSizes.productId))
      .where(
        and(
          eq(products.label, "featured"),
          eq(products.status, "active"),
          not(eq(products.isDeleted, true)),
        ),
      )
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

export async function getProductById(productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      title: products.title,
      description: products.description,
      notes: products.notes,
      category: products.category,
      images: products.images,
      rating: products.rating,
      sizes: sql<ProductSize[]>`
        json_agg(
          json_build_object(
            'id', ${productSizes.id},
            'productId', ${productSizes.productId},
            'value', ${productSizes.value},
            'price', ${productSizes.price},
            'stock', ${productSizes.stock},
            'compareAtPrice', ${productSizes.compareAtPrice}
          )
        )
      `.as("sizes"),
    })
    .from(products)
    .innerJoin(productSizes, eq(products.id, productSizes.productId))
    .where(
      and(
        eq(products.id, productId),
        eq(products.status, "active"),
        not(eq(products.isDeleted, true)),
      ),
    )
    .groupBy(products.id);

  return product;
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
      and(
        inArray(products.id, productIds),
        eq(products.status, "active"),
        not(eq(products.isDeleted, true)),
      ),
    );

  return cartProducts;
}

export async function getEditProduct(productId: string) {
  const [product] = await db
    .select({
      id: products.id,
      title: products.title,
      description: products.description,
      notes: products.notes,
      category: products.category,
      images: products.images,
      tags: products.tags,
      label: products.label,
      status: products.status,
      sizes: sql<ProductSize[]>`
        json_agg(
          json_build_object(
            'id', ${productSizes.id},
            'productId', ${productSizes.productId},
            'value', ${productSizes.value},
            'price', ${productSizes.price},
            'stock', ${productSizes.stock},
            'compareAtPrice', ${productSizes.compareAtPrice}
          )
        )
      `.as("sizes"),
    })
    .from(products)
    .leftJoin(productSizes, eq(products.id, productSizes.productId))
    .where(and(eq(products.id, productId), not(eq(products.isDeleted, true))))
    .groupBy(products.id);

  return product;
}

export async function getDashboardProducts(input: GetDashboardProductsSchema) {
  noStore();

  try {
    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof Product | undefined, "asc" | "desc" | undefined];

    const fromDate = input.from
      ? new Date(new Date(input.from).setHours(0, 0, 0, 0))
      : undefined;

    const toDate = input.to
      ? new Date(new Date(input.to).setHours(23, 59, 59, 999))
      : undefined;

    const expressions: (SQL<unknown> | undefined)[] = [
      input.q
        ? or(
            filterColumn({
              column: products.title,
              value: input.q,
            }),
            filterColumn({
              column: products.description,
              value: input.q,
            }),
            filterColumn({
              column: products.notes,
              value: input.q,
            }),
            filterColumn({
              column: products.category,
              value: input.q,
            }),
            arrayContains(products.tags, [input.q]),
          )
        : undefined,
      !!input.category
        ? filterColumn({
            column: products.category,
            value: input.category,
            isSelectable: true,
          })
        : undefined,
      !!input.status
        ? filterColumn({
            column: products.status,
            value: input.status,
            isSelectable: true,
          })
        : undefined,
      !!input.label
        ? filterColumn({
            column: products.label,
            value: input.label,
            isSelectable: true,
          })
        : undefined,
      fromDate ? gte(products.createdAt, fromDate) : undefined,
      toDate ? lte(products.createdAt, toDate) : undefined,
      not(eq(products.isDeleted, true)),
    ].filter((e) => e !== undefined);

    const where: DrizzleWhere<Product> =
      !input.operator || input.operator === "and"
        ? and(...expressions)
        : or(...expressions);

    const { data, total } = await db.transaction(async (tx) => {
      const { isDeleted: _, userId: __, ...select } = products;

      const data = await tx
        .select({ product: select })
        .from(products)
        .where(where)
        .offset(offset)
        .limit(input.per_page)
        .orderBy(
          column && column in products
            ? order === "asc"
              ? asc(products[column])
              : desc(products[column])
            : desc(products.id),
        )
        .then((res) => res.map((p) => p.product));

      const total = await tx
        .select({ count: count() })
        .from(products)
        .where(where)
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}
