"use client";

import { useCartStore } from "@/stores/use-cart-store";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import Link from "next/link";
import { useBagModal } from "@/stores/use-bag-modal";
import { BagItem } from "./bag-item";
import { Label } from "@/components/ui/label";
import { useMemo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { IconArrowRight } from "@tabler/icons-react";
import { useBagItems } from "@/stores/use-bag-items";

export function BagModal() {
  const { cart, toggleAllSelect, removeAllProducts } = useCartStore();
  const { isOpen, onOpenChange } = useBagModal();

  const totalItems = useMemo(() => {
    return cart.map((item) => item.qty).reduce((acc, curr) => acc + curr, 0);
  }, [cart]);

  const allSelected = useMemo(
    () => cart.every((item) => item.isSelected || item.qty === 0),
    [cart],
  );

  const selectedItems = useMemo(
    () => cart.filter((item) => item.isSelected || item.qty === 0),
    [cart],
  );

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent wrapperClassName="min-h-[86vh]">
        <div className="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>My Bag ({totalItems})</DrawerTitle>

            {cart.length > 0 && (
              <div className="mt-2 flex w-full items-center justify-between gap-3">
                <div className="flex items-center gap-x-2">
                  <Checkbox
                    id="cart-select-all"
                    checked={allSelected}
                    onCheckedChange={toggleAllSelect}
                  />
                  <Label htmlFor="cart-select-all">
                    Selected ({selectedItems.length})
                  </Label>
                </div>
                <button
                  onClick={removeAllProducts}
                  className="text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none"
                >
                  Clear Cart ({selectedItems.length})
                </button>
              </div>
            )}
          </DrawerHeader>

          {cart.length > 0 ? (
            <div className="h-full flex-1 p-4">
              <Content />
            </div>
          ) : null}
        </div>

        {cart.length > 0 ? (
          <DrawerFooter className="sticky inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-lg shrink-0 flex-col items-center justify-between border-t bg-background">
            {!!selectedItems.length ? (
              <Button asChild className="group w-full">
                <Link
                  href="/order/checkout"
                  onClick={() => onOpenChange(false)}
                >
                  Checkout
                  <IconArrowRight className="ml-2 size-[18px] transition-all duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            ) : (
              <Button disabled className="w-full">
                No items selected
              </Button>
            )}

            <p className="text-center text-xs text-muted-foreground">
              Shipping and taxes will be calculated at checkout
            </p>
          </DrawerFooter>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}

function Content() {
  const { data, status, productWithQty } = useBagItems();

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error" || !data) {
    return <div>Error</div>;
  }

  return (
    <div className="flex h-full flex-1 flex-col gap-y-4 divide-y">
      {data.map((product, index) => (
        <BagItem
          className={index > 0 ? "pt-4" : ""}
          product={productWithQty(product)}
          key={product.id + product.size.id}
        />
      ))}
    </div>
  );
}
