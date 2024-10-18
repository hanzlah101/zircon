"use client";

import { useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { SHIPPING_PRICES } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { BagItem, BagItemSkeleton } from "@/app/(shop)/_components/bag-item";
import { useBagItems } from "@/stores/use-bag-items";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useSearchParams } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { orderShippingTypeEnum } from "@/db/schema";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CheckoutProducts() {
  const searchParams = useSearchParams();

  const buyNowItem = useMemo(() => {
    const mode = (searchParams.get("mode") || "cart") as "cart" | "buy-now";

    if (mode === "buy-now") {
      const qty = parseInt(searchParams.get("qty") || "1", 10);
      const productId = searchParams.get("productId") as string;
      const sizeId = searchParams.get("sizeId") as string;
      return { qty, productId, sizeId };
    }
  }, [searchParams]);

  const { inStockItems, productWithQty, isPending } = useBagItems(buyNowItem, {
    throwOnError: true,
  });

  const [shippingType] = useQueryState(
    "shipping_type",
    parseAsStringEnum(orderShippingTypeEnum.enumValues).withDefault("standard"),
  );

  const shippingFee = SHIPPING_PRICES.find(({ type }) => type === shippingType)
    ?.amount as number;

  const subtotal = useMemo(() => {
    return inStockItems?.reduce((acc, curr) => {
      const cartItem = productWithQty(curr);

      const qty = !!buyNowItem ? buyNowItem.qty : cartItem.qty;

      return acc + qty * Number(curr.size.price);
    }, 0) as number;
  }, [inStockItems, productWithQty, buyNowItem]);

  const total = subtotal + shippingFee;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Whole summary of you order</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3.5 text-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-muted-foreground">
              <p>Subtotal</p>
              <Tooltip delayDuration={100}>
                <TooltipTrigger>
                  <IconInfoCircleFilled className="ml-2 size-5 fill-muted-foreground text-background" />
                </TooltipTrigger>
                <TooltipContent className="text-start">
                  Total excluding shipping <br /> and taxes.
                </TooltipContent>
              </Tooltip>
            </div>
            {isPending ? (
              <Skeleton className="h-5 w-28 rounded" />
            ) : (
              <p className="font-medium">{formatPrice(subtotal)}</p>
            )}
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Shipping</p>
            <p className="font-medium">{formatPrice(shippingFee)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Taxes</p>
            <p className="font-medium">{formatPrice(0)}</p>
          </div>
        </div>

        <div className="mb-6 border-b pb-6">
          <div className="flex items-center justify-between pt-5 text-sm">
            <p>Total</p>
            {isPending ? (
              <Skeleton className="h-[27px] w-32 rounded" />
            ) : (
              <p className="text-lg font-medium">{formatPrice(total)}</p>
            )}
          </div>
        </div>

        {isPending ? (
          <BagItemSkeleton count={!!buyNowItem ? 1 : undefined} />
        ) : (
          <ul className="space-y-4 divide-y">
            {inStockItems?.map((product, index) => (
              <BagItem
                className={index > 0 ? "pt-4" : ""}
                key={product.id + product.size.id}
                product={productWithQty(product)}
              />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
