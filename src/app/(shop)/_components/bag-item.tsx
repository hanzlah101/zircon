"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/stores/use-cart-store";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { parseAsInteger, useQueryState } from "nuqs";
import { Label } from "@/components/ui/label";
import { useBagModal } from "@/stores/use-bag-modal";

import type { ProductSize } from "@/db/schema";
import type { ProductImage } from "@/db/types";

type BagItemProps = {
  className?: string;
  product: {
    id: string;
    title: string;
    images: ProductImage[];
    size: ProductSize;
    qty: number;
  };
};

export function BagItem({ product, className }: BagItemProps) {
  const { changeProductQty, removeFromCart } = useCartStore();
  const { onClose } = useBagModal();

  const searchParams = useSearchParams();
  const mode = (searchParams.get("mode") || "cart") as "cart" | "buy-now";

  const [buyNowQty, setBuyNowQty] = useQueryState(
    "qty",
    parseAsInteger.withDefault(1),
  );

  const qty = mode === "buy-now" ? buyNowQty : product.qty;

  const [inputValue, setInputValue] = useState(qty);

  const handleChangeQty = (q: number) => {
    const newQty = q > product.size.stock ? product.size.stock : q;

    setInputValue(newQty);

    if (mode === "buy-now") {
      setBuyNowQty(newQty);
    } else {
      changeProductQty({
        qty: newQty,
        productId: product.id,
        sizeId: product.size.id,
      });
    }
  };

  const increaseQty = () => {
    if (qty >= product.size.stock) return;
    handleChangeQty(qty + 1);
  };

  const decreaseQty = () => {
    if (qty <= 1) return;
    handleChangeQty(qty - 1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product.size.stock) return;
    const newVal = e.target.valueAsNumber;

    if (isNaN(newVal)) {
      setInputValue(NaN);
      return;
    }

    if (newVal === 0) {
      return;
    }

    handleChangeQty(newVal);
  };

  const image = useMemo(
    () => product.images.sort((a, b) => a.order - b.order)[0],
    [product.images],
  );

  useEffect(() => {
    if (qty > product.size.stock) {
      handleChangeQty(product.size.stock);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qty, product.size.stock]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative size-28 overflow-hidden rounded-md bg-accent">
        <Image fill src={image.url} alt={product.title} objectFit="cover" />
      </div>

      <div className="flex flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          <Link
            href={`/p/${product.id}`}
            onClick={onClose}
            className="line-clamp-1 text-sm font-medium hover:underline hover:underline-offset-4"
          >
            {product.title}
          </Link>

          <p className="text-xs text-muted-foreground">
            Size:{" "}
            <span className="text-foreground">{product.size.value} ml</span>
          </p>

          <div className="space-y-1">
            <Label
              htmlFor={`${product.size.id}-qty`}
              className="sr-only sm:not-sr-only"
            >
              Quantity:{" "}
            </Label>
            <div className="flex items-center">
              <Button
                onClick={decreaseQty}
                size="icon"
                radius={"none"}
                disabled={qty <= 1}
                variant={"secondary"}
                className="size-7"
              >
                <IconMinus className="size-4" />
              </Button>

              <input
                type="number"
                min="1"
                id={`${product.size.id}-qty`}
                max={product.size.stock}
                value={inputValue}
                disabled={!product.size.stock}
                onChange={handleChange}
                onBlur={() => setInputValue(qty)}
                className="z-10 h-7 border-y border-secondary bg-transparent px-1 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />

              <Button
                onClick={increaseQty}
                size="icon"
                radius={"none"}
                disabled={product.size.stock <= qty}
                variant={"secondary"}
                className="size-7"
              >
                <IconPlus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between">
          <h3 className="text-sm font-medium">
            {formatPrice(Number(product.size.price) * qty)}
          </h3>
          {mode === "cart" ? (
            <button
              className="mt-auto flex items-center gap-x-2 text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none"
              onClick={() =>
                removeFromCart({
                  productId: product.id,
                  sizeId: product.size.id,
                })
              }
            >
              <IconTrash className="size-4" />
              Remove
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type BagItemSkeletonProps = {
  count?: number;
};

export function BagItemSkeleton({ count }: BagItemSkeletonProps) {
  const { cart } = useCartStore();

  return (
    <div className="space-y-4 divide-y">
      {Array.from({ length: count || cart.length || 3 }).map((_, i) => (
        <div key={i} className={cn("flex items-center gap-3", i > 0 && "pt-4")}>
          <Skeleton className="size-28 shrink-0 rounded-md" />

          <div className="w-full flex-1 space-y-2.5">
            <Skeleton className="h-4 w-2/3 rounded" />
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-6 w-full max-w-28 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
