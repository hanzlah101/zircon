"use client";

import { format, isDate } from "date-fns";
import { type Order, orderStatusEnum } from "@/db/schema";
import { capitalize } from "@/lib/utils";
import { CardContent, CardFooter } from "@/components/ui/card";
import { IconRefresh } from "@tabler/icons-react";
import {
  Timeline,
  TimelineContent,
  TimelineDot,
  TimelineHeading,
  TimelineItem,
  TimelineLine,
} from "@/components/ui/timeline";

import type { getOrderById } from "@/queries/order.queries";
import { refreshOrder } from "@/actions/order/order.actions";
import { useConfetti } from "@/hooks/use-confetti";
import { useParams } from "next/navigation";
import { useServerAction } from "@/hooks/use-server-action";
import { StatusButton } from "@/components/ui/status-button";
import { CancelOrderAlert } from "./cancel-order-alert";
import { Button } from "@/components/ui/button";
import { getOrderEventDescription } from "@/lib/constants";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const statusOrder = orderStatusEnum.enumValues.filter(
  (status) => status !== "cancelled" && status !== "on_hold",
);

interface OrderTimelineProps extends Awaited<ReturnType<typeof getOrderById>> {}

export function OrderTimeline({ events, ...order }: OrderTimelineProps) {
  const { orderId }: { orderId: string } = useParams();

  useConfetti();
  const { mutate: refresh, status: refreshStatus } =
    useServerAction(refreshOrder);

  const getItemDate = (status: Order["status"]) => {
    const event = events[status];
    const currentIndex = statusOrder.indexOf(
      order.status as (typeof statusOrder)[number],
    );
    const itemIndex = statusOrder.indexOf(
      status as (typeof statusOrder)[number],
    );

    if (!event?.date || itemIndex > currentIndex) return;

    const date = status === "processing" ? order.createdAt : event.date;
    return isDate(new Date(date))
      ? format(new Date(date), "MMM dd, yyyy hh:mm a")
      : null;
  };

  const getItemDescription = (status: (typeof statusOrder)[number]) => {
    const event = events[status];
    const currentIndex = statusOrder.indexOf(
      order.status as (typeof statusOrder)[number],
    );
    const itemIndex = statusOrder.indexOf(
      status as (typeof statusOrder)[number],
    );

    if (itemIndex <= currentIndex)
      return event?.description || getOrderEventDescription(order);

    const descriptions = {
      processing: "Order is being processed.",
      dispatched: "Order is about to be dispatched.",
      shipped: "Order is about to be shipped.",
      delivered: "Order is about to be delivered.",
    } as const;

    return descriptions[status];
  };

  const getItemStatus = (status: Order["status"]) => {
    const currentIndex = statusOrder.indexOf(
      order.status as (typeof statusOrder)[number],
    );

    const itemIndex = statusOrder.indexOf(
      status as (typeof statusOrder)[number],
    );

    if (status === "processing")
      return order.status === "processing" ? "current" : "done";
    if (itemIndex < currentIndex) return "done";
    if (itemIndex === currentIndex)
      return status === "delivered" ? "done" : "current";
    return "default";
  };

  const getItemTitle = (status: Order["status"]) => {
    const date = getItemDate(status);
    if (!date) return capitalize(status);

    return (
      <>
        {capitalize(status)} -{" "}
        <span className="text-[13px] font-medium text-muted-foreground">
          {date}
        </span>
      </>
    );
  };

  return (
    <>
      <CardContent>
        <Timeline>
          {statusOrder.map((status) => (
            <TimelineItem key={status} status={getItemStatus(status)}>
              <TimelineHeading>{getItemTitle(status)}</TimelineHeading>
              <TimelineDot />
              {status !== "delivered" ||
              order.status === "cancelled" ||
              order.status === "on_hold" ? (
                <TimelineLine />
              ) : null}
              <TimelineContent>{getItemDescription(status)}</TimelineContent>
            </TimelineItem>
          ))}

          {order.status === "on_hold" && (
            <TimelineItem status="intermediate">
              <TimelineHeading>{getItemTitle("on_hold")}</TimelineHeading>
              <TimelineDot />
              <TimelineContent>
                {events.on_hold?.description || "Your order is on hold"}
              </TimelineContent>
            </TimelineItem>
          )}

          {order.status === "cancelled" && (
            <TimelineItem status="error">
              <TimelineHeading>{getItemTitle("cancelled")}</TimelineHeading>
              <TimelineDot />
              <TimelineContent>
                {events.cancelled?.description || "Order cancelled"}
              </TimelineContent>
            </TimelineItem>
          )}
        </Timeline>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-4">
        {order.status === "processing" ? (
          <CancelOrderAlert />
        ) : (
          <Tooltip delayDuration={150}>
            <TooltipTrigger asChild>
              <Button variant="outline" className="cursor-default opacity-50">
                Cancel Order
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-[320px]">
              {order.status === "cancelled"
                ? "Order already cancelled"
                : "Order can't be canceled once processed. Please contact support."}
            </TooltipContent>
          </Tooltip>
        )}

        <StatusButton
          status={refreshStatus}
          successMessage="Refreshed"
          onClick={() => refresh({ id: orderId })}
        >
          <IconRefresh className="mr-2 size-[18px]" />
          Refresh
        </StatusButton>
      </CardFooter>
    </>
  );
}
