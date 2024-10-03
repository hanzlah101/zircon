"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { IconMinus, IconPlus, IconTrash } from "@tabler/icons-react";

import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCartStore } from "@/stores/use-cart-store";

import type { ProductSize } from "@/db/schema";
import type { ProductImage } from "@/db/types";

type BagItemProps = {
  className?: string;
  product: {
    id: string;
    title: string;
    images: ProductImage[];
    size: ProductSize;
    isSelected: boolean;
    qty: number;
  };
};

export function BagItem({ product, className }: BagItemProps) {
  const { changeProductQty, removeFromCart, toggleSelectItem } = useCartStore();
  const [inputValue, setInputValue] = useState(product.qty);

  const increaseQty = () => {
    if (product.qty >= product.size.stock) return;

    changeProductQty({
      productId: product.id,
      sizeId: product.size.id,
      qty: product.qty + 1,
      isSelected: true,
    });
  };

  const decreaseQty = () => {
    if (product.qty <= 1) {
      changeProductQty({
        productId: product.id,
        sizeId: product.size.id,
        qty: 1,
        isSelected: true,
      });
    }

    changeProductQty({
      productId: product.id,
      sizeId: product.size.id,
      qty: product.qty - 1,
      isSelected: true,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!product.size.stock) return;
    const newVal = e.target.valueAsNumber;
    if (isNaN(newVal)) {
      setInputValue(NaN);
      return;
    }

    const qty =
      newVal > product.size.stock
        ? product.size.stock
        : newVal === 0
          ? 1
          : newVal;

    setInputValue(newVal === 0 ? 1 : qty);

    changeProductQty({
      productId: product.id,
      sizeId: product.size.id,
      isSelected: true,
      qty,
    });
  };

  const image = useMemo(
    () => product.images.sort((a, b) => a.order - b.order)[0],
    [product.images],
  );

  useEffect(() => setInputValue(product.qty), [product.qty]);

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="relative size-28 overflow-hidden rounded-md bg-accent">
        <Image fill src={image.url} alt={product.title} objectFit="cover" />
      </div>

      <div className="flex flex-1 justify-between gap-4">
        <div className="space-y-2.5">
          <h3 className="text-sm font-medium">{product.title}</h3>
          <h3 className="text-sm font-medium">
            {formatPrice(product.size.price)}
          </h3>
          <p className="text-xs text-muted-foreground">
            Size:{" "}
            <span className="text-foreground">{product.size.value} ml</span>
          </p>
          <div className="space-y-1">
            <span className="sr-only text-sm sm:not-sr-only">Quantity: </span>
            <div className="flex items-center">
              <Button
                onClick={decreaseQty}
                size="icon"
                radius={"none"}
                disabled={product.qty <= 1}
                variant={"secondary"}
                className="size-7"
              >
                <IconMinus className="size-4" />
              </Button>

              <input
                type="number"
                min="1"
                max={product.size.stock}
                value={inputValue}
                disabled={!product.size.stock}
                onChange={handleChange}
                onBlur={() => setInputValue(product.qty)}
                className="z-10 h-7 border-y border-secondary bg-transparent px-1 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />

              <Button
                onClick={increaseQty}
                size="icon"
                radius={"none"}
                disabled={product.size.stock <= product.qty}
                variant={"secondary"}
                className="size-7"
              >
                <IconPlus className="size-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end justify-between">
          <Checkbox
            checked={product.isSelected}
            onCheckedChange={() =>
              toggleSelectItem({
                productId: product.id,
                sizeId: product.size.id,
              })
            }
          />

          <button
            className="mt-auto flex items-center gap-x-2 text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none"
            onClick={() =>
              removeFromCart({ productId: product.id, sizeId: product.size.id })
            }
          >
            <IconTrash className="size-4" />
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}
