"use client";

import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

import ky from "ky";
import Image from "next/image";
import Link from "next/link";
import { ProductImage } from "@/db/types";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useEditOrderModal } from "@/stores/use-edit-order-modal";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";

export function EditOrderModal() {
  const { data, isOpen, onClose } = useEditOrderModal();

  if (!data) return null;

  return (
    <Drawer open={isOpen} onClose={onClose}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Edit order #{data.trackingId}</DrawerTitle>
          <DrawerDescription>
            Make changes to shipping, price, or delivery preferences for this
            order
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-4 px-4">
          <OrderProducts orderId={data.id} />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

type OrderProductsProps = {
  orderId: string;
};

function OrderProducts({ orderId }: OrderProductsProps) {
  const { onClose } = useEditOrderModal();

  const { status, data, refetch } = useQuery({
    queryKey: ["order-items", orderId],
    queryFn: async () => {
      const { data } = await ky
        .get(`/api/products/order?orderId=${orderId}`)
        .json<{
          data: {
            price: string;
            size: string;
            quantity: number;
            product: {
              id: string;
              title: string;
              images: ProductImage[];
            };
          }[];
        }>();

      return data;
    },
  });

  if (status === "pending") {
    return (
      <div className="flex items-center gap-3">
        <Skeleton className="size-28 shrink-0 rounded-md" />
        <div className="w-full flex-1 space-y-2.5">
          <Skeleton className="h-4 w-2/3 rounded" />
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-4 w-full max-w-28 rounded" />
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 py-6">
        <IconAlertTriangle className="size-7 text-destructive" />
        <h1 className="font-medium">
          Error fetching products, please try again
        </h1>
        <Button variant={"outline"} size={"sm"}>
          <IconRefresh onClick={() => refetch()} className="mr-2 size-4" />
          Retry
        </Button>
      </div>
    );
  }

  if (!data || !data.length) {
    return (
      <div className="flex w-full flex-col items-center justify-center gap-2 py-6">
        <IconAlertTriangle className="size-7 text-destructive" />
        <h1 className="font-medium">
          Shockingly! No products found for the order
        </h1>
        <Button variant={"outline"} size={"sm"}>
          <IconRefresh onClick={() => refetch()} className="mr-2 size-4" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h1 className="font-heading text-2xl">Ordered Items</h1>
      <ul className="w-full space-y-4">
        {data.map((item, index) => (
          <li key={item.size + index} className="flex items-center gap-3">
            <div className="relative size-28 overflow-hidden rounded-md bg-accent">
              <Image
                fill
                alt={item.product.title}
                objectFit="cover"
                src={
                  item.product.images.sort((a, b) => a.order - b.order)[0].url
                }
              />
            </div>

            <div className="space-y-2.5">
              <Link
                href={`/dashboard/products/edit/${item.product.id}`}
                onClick={onClose}
                className="line-clamp-1 text-sm font-medium hover:underline hover:underline-offset-4"
              >
                {item.product.title}
              </Link>

              <p className="text-xs text-muted-foreground">
                Size: <span className="text-foreground">{item.size} ml</span>
              </p>

              <p className="text-xs font-medium text-muted-foreground">
                Quantity:{" "}
                <span className="text-foreground">{item.quantity}</span>
              </p>

              <p className="text-sm font-medium text-muted-foreground">
                Price:{" "}
                <span className="text-foreground">
                  {formatPrice(item.price)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
