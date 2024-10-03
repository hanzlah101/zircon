"use client";

import { useMemo } from "react";
import { formatPrice } from "@/lib/utils";
import { DEFAULT_SHIPPING_PRICE } from "@/lib/constants";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { BagItem } from "@/app/(shop)/_components/bag-item";
import { useBagItems } from "@/stores/use-bag-items";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function CheckoutProducts() {
  const { data, productWithQty } = useBagItems();

  const subtotal = useMemo(() => {
    return data?.reduce((acc, curr) => {
      const { qty } = productWithQty(curr);
      return acc + qty * Number(curr.size.price);
    }, 0) as number;
  }, [data, productWithQty]);

  const total = subtotal + DEFAULT_SHIPPING_PRICE;

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle>Summary</CardTitle>
        <CardDescription>Whole summary of you order</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-3.5 pt-5 text-sm">
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
            <p className="font-medium">{formatPrice(subtotal)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Shipping</p>
            <p className="font-medium">{formatPrice(DEFAULT_SHIPPING_PRICE)}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Taxes</p>
            <p className="font-medium">{formatPrice(0)}</p>
          </div>
        </div>

        <div className="mb-6 border-b pb-6">
          <div className="flex items-center justify-between pt-5 text-sm">
            <p>Total</p>
            <p className="text-lg font-medium">{formatPrice(total)}</p>
          </div>
        </div>

        <ul className="space-y-4 divide-y">
          {data?.map((product, index) => (
            <BagItem
              className={index > 0 ? "pt-4" : ""}
              key={product.id + product.size.id}
              product={productWithQty(product)}
            />
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
