// TODO: handle this

import * as React from "react";
import { orders, payments } from "@/db/schema";
import {
  IconCircleCheck,
  IconX,
  IconDownload,
  IconTrash,
  IconCreditCard,
} from "@tabler/icons-react";

import { toast } from "sonner";
import { SelectTrigger } from "@radix-ui/react-select";
import { type Table } from "@tanstack/react-table";

import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
} from "@/components/ui/select";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/ui/kbd";
import { Spinner } from "@/components/ui/spinner";
import { capitalize } from "@/lib/utils";
import { getErrorMessage } from "@/lib/errors";
import { DeleteOrdersDialog } from "./delete-orders-dialog";
import { updateOrdersStatus } from "@/actions/order/order.actions";
import type { OrderWithPayment } from "@/db/types";

interface OrdersTableFloatingBarProps {
  table: Table<OrderWithPayment>;
}

export function OrdersTableFloatingBar({ table }: OrdersTableFloatingBarProps) {
  const rows = table.getFilteredSelectedRowModel().rows;

  const [showDeleteOrdersDialog, setShowDeleteOrdersDialog] =
    React.useState(false);

  const [isPending, startTransition] = React.useTransition();
  const [method, setMethod] = React.useState<
    "update-status" | "update-payment-status" | "export"
  >();

  // Clear selection on Escape key press
  React.useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        table.toggleAllRowsSelected(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [table]);

  return (
    <>
      <DeleteOrdersDialog
        open={showDeleteOrdersDialog}
        onOpenChange={setShowDeleteOrdersDialog}
        showTrigger={false}
        orders={rows.map((row) => row.original)}
        onSuccess={() => table.toggleAllRowsSelected(false)}
      />

      <div className="fixed inset-x-0 bottom-4 z-50 mx-auto w-fit px-4">
        <div className="w-full overflow-x-auto">
          <div className="mx-auto flex w-fit items-center gap-2 rounded-md border bg-card p-2 shadow-2xl">
            <div className="flex h-7 items-center rounded-md border border-dashed pl-2.5 pr-1">
              <span className="whitespace-nowrap text-xs">
                {rows.length} selected
              </span>
              <Separator orientation="vertical" className="ml-2 mr-1" />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-5 hover:border"
                    onClick={() => table.toggleAllRowsSelected(false)}
                  >
                    <IconX className="size-3.5 shrink-0" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="flex items-center border bg-accent px-2 py-1 font-semibold text-foreground dark:bg-zinc-900">
                  <p className="mr-2">Clear selection</p>
                  <Kbd abbrTitle="Escape" variant="outline">
                    Esc
                  </Kbd>
                </TooltipContent>
              </Tooltip>
            </div>
            <Separator orientation="vertical" className="hidden h-5 sm:block" />
            <div className="flex items-center gap-1.5">
              <Select
                onValueChange={(value: OrderWithPayment["status"]) => {
                  setMethod("update-status");

                  startTransition(async () => {
                    const result = await updateOrdersStatus({
                      ids: rows.map((row) => row.original.id),
                      status: value,
                    });

                    if (!result) return;

                    const [_, err] = result;

                    if (err) {
                      toast.error(getErrorMessage(err));
                      return;
                    }

                    toast.success("Orders updated");
                  });
                }}
              >
                <Tooltip delayDuration={250}>
                  <SelectTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                        disabled={isPending}
                      >
                        {isPending && method === "update-status" ? (
                          <Spinner size={"sm"} aria-hidden="true" />
                        ) : (
                          <IconCircleCheck
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                  </SelectTrigger>
                  <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                    <p>Update status</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent align="center">
                  <SelectGroup>
                    {orders.status.enumValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {capitalize(status)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Select
                onValueChange={(value: OrderWithPayment["paymentStatus"]) => {
                  setMethod("update-payment-status");

                  startTransition(async () => {
                    const result = await updateOrdersStatus({
                      ids: rows.map((row) => row.original.id),
                      paymentStatus: value,
                    });

                    if (!result) return;

                    const [_, err] = result;

                    if (err) {
                      toast.error(getErrorMessage(err));
                      return;
                    }

                    toast.success("Orders updated");
                  });
                }}
              >
                <Tooltip delayDuration={250}>
                  <SelectTrigger asChild>
                    <TooltipTrigger asChild>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="size-7 border data-[state=open]:bg-accent data-[state=open]:text-accent-foreground"
                        disabled={isPending}
                      >
                        {isPending && method === "update-payment-status" ? (
                          <Spinner size={"sm"} aria-hidden="true" />
                        ) : (
                          <IconCreditCard
                            className="size-3.5"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                    </TooltipTrigger>
                  </SelectTrigger>
                  <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                    <p>Update payment status</p>
                  </TooltipContent>
                </Tooltip>
                <SelectContent align="center">
                  <SelectGroup>
                    {payments.status.enumValues.map((status) => (
                      <SelectItem key={status} value={status}>
                        {capitalize(status)}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>

              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    onClick={() => {
                      setMethod("export");

                      startTransition(() => {
                        exportTableToCSV(table, {
                          filename: "orders",
                          excludeColumns: ["select", "actions"],
                          onlySelected: true,
                        });
                      });
                    }}
                    disabled={isPending}
                  >
                    {isPending && method === "export" ? (
                      <Spinner size={"sm"} aria-hidden="true" />
                    ) : (
                      <IconDownload className="size-3.5" aria-hidden="true" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Export orders</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={250}>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="size-7 border"
                    disabled={isPending}
                    onClick={() => setShowDeleteOrdersDialog(true)}
                  >
                    <IconTrash className="size-3.5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="border bg-accent font-semibold text-foreground dark:bg-zinc-900">
                  <p>Delete orders</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
