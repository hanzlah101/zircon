"use client";

import { use } from "react";

import { ProductReel } from "./product-reel";
import type { getFeaturedProducts } from "@/queries/product.queries";

type FeaturedProductsProps = {
  featuredProductsPromise: ReturnType<typeof getFeaturedProducts>;
};

export function FeaturedProducts({
  featuredProductsPromise,
}: FeaturedProductsProps) {
  const featuredProducts = use(featuredProductsPromise);

  return (
    <>
      {featuredProducts.map((product) => (
        <ProductReel key={product.id} product={product} />
      ))}
    </>
  );
}
