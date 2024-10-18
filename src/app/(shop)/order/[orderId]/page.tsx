import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { getOrderById } from "@/queries/order.queries";
import { notFound } from "next/navigation";
import { OrderTimeline } from "./_components/order-timeline";
import { IconInfoCircleFilled } from "@tabler/icons-react";
import { capitalize, cn, formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { format, isDate } from "date-fns";
import type { Order } from "@/db/schema";

type OrderPageProps = {
  params: {
    orderId: string;
  };
};

export default async function OrderPage({ params }: OrderPageProps) {
  const order = await getOrderById(params.orderId);

  if (!order) notFound();

  const estDeliveryDate = order.estDeliveryDate
    ? `, to be delivered on ${format(order.estDeliveryDate, "MMM dd, yyyy")}`
    : "";

  function getEventDate(status: Order["status"]) {
    const event = order.events[status];
    const validDate = event?.date && isDate(new Date(event?.date));
    if (validDate) return ` on ${format(event?.date, "MMM dd, yyyy")}`;
    return "";
  }

  function description() {
    switch (order.status) {
      case "cancelled":
        return `Order cancelled${getEventDate("cancelled")}`;
      case "delivered":
        return `Order delivered${getEventDate("delivered")}`;
      case "on_hold":
        return `Your order is on hold${estDeliveryDate}`;

      default:
        return `Your order ${order.status}${estDeliveryDate}`;
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-4 px-4 py-6">
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          Track the delivery of order #
          <span className="font-bold">{order.trackingId}</span>
        </h1>

        <p
          className={cn("text-[15px] font-medium text-muted-foreground", {
            "text-emerald-600": order.status === "delivered",
            "text-destructive": order.status === "cancelled",
            "text-yellow-600": order.status === "on_hold",
          })}
        >
          {description()}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[340px_1fr] lg:grid-cols-3">
        <Card className="h-fit">
          <CardHeader className="flex-row items-start justify-between gap-3 space-y-0">
            <div className="flex flex-col space-y-1.5">
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your order journey over time
              </CardDescription>
            </div>

            <Badge
              variant={
                order.payment.status === "paid" ? "success" : "destructive"
              }
            >
              {capitalize(order.payment.status)}
            </Badge>
          </CardHeader>

          <OrderTimeline {...order} />
        </Card>

        <Card className="h-fit lg:col-span-2">
          <CardHeader>
            <CardTitle>Products</CardTitle>
            <CardDescription>
              View the products you&apos;ve purchased
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-y-4 divide-y">
            {order.items.map((item, index) => (
              <div
                key={item.id + item.size + index}
                className={cn("flex items-center gap-3", {
                  "pt-4": index > 0,
                })}
              >
                <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-accent">
                  <Image
                    fill
                    objectFit="cover"
                    alt={item.product.title}
                    src={
                      item.product.images.sort((a, b) => a.order - b.order)[0]
                        .url
                    }
                  />
                </div>

                <div className="space-y-2.5">
                  <Link
                    href={`/p/${item.productId}`}
                    className="line-clamp-1 text-sm font-medium hover:underline hover:underline-offset-4"
                  >
                    {item.product.title}
                  </Link>

                  <p className="text-xs font-medium text-muted-foreground">
                    Size:{" "}
                    <span className="text-foreground">{item.size} ml</span>
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
              </div>
            ))}
          </CardContent>

          <CardFooter className="w-full border-t pt-6">
            <div className="w-full space-y-3.5 text-sm">
              <div className="flex w-full items-center justify-between">
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

                <p className="font-medium">
                  {formatPrice(order.payment.subtotal)}
                </p>
              </div>

              <div className="flex w-full items-center justify-between">
                <p className="text-muted-foreground">Shipping</p>
                <p className="font-medium">
                  {formatPrice(order.payment.shippingFee)}
                </p>
              </div>

              <div className="flex w-full items-center justify-between">
                <p className="text-muted-foreground">Taxes</p>
                <p className="font-medium">{formatPrice(0)}</p>
              </div>

              {order.payment.discount && Number(order.payment.discount) > 0 ? (
                <div className="flex w-full items-center justify-between text-emerald-600">
                  <p>Discount</p>
                  <p className="font-medium">
                    - {formatPrice(order.payment.discount)}
                  </p>
                </div>
              ) : null}

              <div className="flex w-full items-center justify-between border-t pt-5 text-[17px]">
                <p className="font-medium">Total</p>

                <p className="font-semibold">
                  {formatPrice(
                    Number(order.payment.subtotal) +
                      Number(order.payment.shippingFee) +
                      Number(order.payment.taxes) -
                      Number(order.payment.discount),
                  )}
                </p>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
