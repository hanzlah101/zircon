"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { ProductSize } from "@/db/schema";
import type { ProductImage } from "@/db/types";
import { DirectionAwareHover } from "@/components/ui/direction-aware-hover";
import { RatingStarsPreview } from "./rating-stars-preview";
import { Button } from "@/components/ui/button";
import { IconShoppingBag } from "@tabler/icons-react";
import { cn, formatPrice } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useCartStore } from "@/stores/use-cart-store";
import { useBagModal } from "@/stores/use-bag-modal";
import { useQueryClient } from "@tanstack/react-query";

type ProductReelProps = {
  product: {
    id: string;
    title: string;
    images: ProductImage[];
    rating: string;
    sizes: ProductSize[];
  };
};

export function ProductReel({ product }: ProductReelProps) {
  const { addToCart } = useCartStore();
  const { onOpen } = useBagModal();
  const queryClient = useQueryClient();

  const image = useMemo(
    () => product.images.sort((a, b) => a.order - b.order)[0],
    [product.images],
  );

  const sizes = useMemo(
    () => product.sizes.sort((a, b) => a.value - b.value),
    [product.sizes],
  );

  const firstSize = useMemo(
    () => sizes.filter((size) => size.stock > 0)[0],
    [sizes],
  );

  const [selectedSize, setSelectedSize] = useState(firstSize);

  const handleSizeChange = (size: ProductSize) => {
    return (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setSelectedSize(size);
    };
  };

  const handleAddToBag = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addToCart({
      qty: 1,
      productId: product.id,
      sizeId: selectedSize?.id,
      stock: selectedSize?.stock,
      isSelected: true,
    });

    onOpen();
    queryClient.invalidateQueries({ queryKey: ["cart-products"] });
  };

  const isOutOfStock = !selectedSize || selectedSize?.stock <= 0;

  useEffect(() => {
    if (!selectedSize) {
      setSelectedSize(firstSize);
    }
  }, [sizes, selectedSize, firstSize]);

  return (
    <Link href={`/p/${product.id}`} className="">
      <div className="relative aspect-square w-full">
        <DirectionAwareHover
          imageUrl={image.url}
          childrenClassName="w-full max-w-[88%] space-y-3 dark"
        >
          <div className="flex items-center gap-3">
            <div className="rounded-sm bg-yellow-600 px-2 py-0.5 text-sm text-white">
              {product.rating}
            </div>
            <RatingStarsPreview
              rating={Number(product.rating)}
              starClassName="dark:data-[state=empty]:text-neutral-300"
            />
          </div>

          {sizes.length > 1 ? (
            <div className="flex flex-wrap items-center gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={handleSizeChange(size)}
                  className={cn(
                    "relative flex items-center justify-center border border-primary p-2 text-sm focus-visible:outline-none disabled:pointer-events-none disabled:opacity-70",
                    selectedSize?.id === size.id
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-transparent hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  {size.value} ml
                  {size.stock <= 0 ? (
                    <div className="absolute left-1/2 top-1/2 z-10 h-full w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                  ) : null}
                </button>
              ))}
            </div>
          ) : null}

          <Button
            radius={"none"}
            onClick={handleAddToBag}
            className={cn("w-full", {
              "cursor-not-allowed bg-neutral-400 text-white hover:bg-neutral-400":
                isOutOfStock,
            })}
          >
            {!isOutOfStock ? (
              <IconShoppingBag className="mr-2 size-[18px]" />
            ) : null}

            {isOutOfStock ? "Out of stock" : "Add to bag"}
          </Button>
        </DirectionAwareHover>
      </div>

      <h1 className="mt-3 font-semibold">
        {product.title}
        {sizes.length === 1 ? ` - ${sizes[0].value} ml` : null}
      </h1>
      <h1 className="mt-1 font-semibold md:text-xl">
        {formatPrice(selectedSize?.price || firstSize?.price || sizes[0].price)}
      </h1>
    </Link>
  );
}

export function ProductReelSkeleton() {
  return (
    <div className="w-full space-y-2">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-5 w-full rounded" />
      <Skeleton className="h-6 w-3/4 rounded" />
    </div>
  );
}
