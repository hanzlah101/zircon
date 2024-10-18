"use client";

import { useMemo } from "react";
import { useCartStore } from "@/stores/use-cart-store";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import Link from "next/link";
import { useBagModal } from "@/stores/use-bag-modal";
import { BagItem, BagItemSkeleton } from "./bag-item";
import { Button } from "@/components/ui/button";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconArrowRight,
  IconReload,
} from "@tabler/icons-react";

import { useBagItems } from "@/stores/use-bag-items";
import { cn } from "@/lib/utils";
import { EmptyBagIcon } from "@/components/icons/empty-bag";

export function BagModal() {
  const { cart, removeAllProducts } = useCartStore();
  const { isOpen, onOpenChange } = useBagModal();

  const { data } = useBagItems();

  const totalItems = useMemo(() => {
    return cart.map((item) => item.qty).reduce((acc, curr) => acc + curr, 0);
  }, [cart]);

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent wrapperClassName="min-h-[86vh]">
        <div className="mx-auto flex h-full w-full max-w-lg flex-1 flex-col">
          {cart.length > 0 && (
            <DrawerHeader className="flex items-center justify-between">
              <DrawerTitle>My Bag ({totalItems})</DrawerTitle>

              <button
                onClick={removeAllProducts}
                className="text-sm text-muted-foreground transition-colors hover:text-destructive focus-visible:outline-none"
              >
                Clear Cart
              </button>
            </DrawerHeader>
          )}

          {cart.length > 0 ? (
            <div className="flex h-full flex-1 flex-col p-4">
              <Content />
            </div>
          ) : (
            <div className="flex h-[86vh] flex-col items-center justify-center p-4">
              <EmptyBagIcon />
              <DrawerHeader className="pt-5 sm:place-items-center sm:text-center">
                <DrawerTitle>Your bag is empty</DrawerTitle>
                <DrawerDescription>
                  Your bag is empty. Add some items to your bag to continue.
                </DrawerDescription>
              </DrawerHeader>

              <Button asChild className="group">
                <Link href="/p">
                  <IconArrowLeft className="mr-2 size-[18px] transition-all duration-300 group-hover:-translate-x-1" />
                  Explore latest products
                </Link>
              </Button>
            </div>
          )}
        </div>

        {cart.length > 0 ? (
          <DrawerFooter className="sticky inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-lg shrink-0 flex-col items-center justify-between border-t bg-background">
            {!!data?.length ? (
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
                Loading...
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
  const { inStockItems, outOfStockItems, status, productWithQty, refetch } =
    useBagItems();

  if (status === "pending") {
    return <BagItemSkeleton />;
  }

  if (status === "error") {
    return (
      <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-1">
        <div className="rounded-full bg-destructive/10 p-2 text-destructive">
          <IconAlertTriangle className="size-8" />
        </div>
        <p className="text-sm text-muted-foreground">
          Something went wrong. Please try again.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          <IconReload className="mr-2 size-[18px]" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div>
      {inStockItems.length > 0 ? (
        <div className="flex h-full flex-1 flex-col gap-y-4 divide-y">
          {inStockItems.map((product, index) => (
            <BagItem
              className={index > 0 ? "pt-4" : ""}
              product={productWithQty(product)}
              key={product.id + product.size.id}
            />
          ))}
        </div>
      ) : null}

      {outOfStockItems.length > 0 ? (
        <div className={cn(inStockItems.length > 0 && "pt-6")}>
          <h3 className="font-medium text-destructive underline underline-offset-4">
            Unavailable
          </h3>
          <div className="mt-4 flex h-full flex-1 flex-col gap-y-4 divide-y">
            {outOfStockItems?.map((product, index) => (
              <BagItem
                className={index > 0 ? "pt-4" : ""}
                product={productWithQty(product)}
                key={product.id + product.size.id}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
