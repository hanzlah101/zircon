"use client";

import * as React from "react";
import { capitalize, formatPrice } from "@/lib/utils";
import { type ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/app/dashboard/_components/data-table/data-table-column-header";
import type { OrderWithPayment } from "@/db/types";
import { ItemWithCopyButton } from "@/components/item-with-copy-button";
import { DeleteOrdersDialog } from "./delete-orders-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Button } from "@/components/ui/button";
import { IconDots } from "@tabler/icons-react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { orders, payments } from "@/db/schema";
import { UpdateOrdersStatusSchema } from "@/validators/order.validators";
import { updateOrdersStatus } from "@/actions/order/order.actions";
import { useEditOrderModal } from "@/stores/use-edit-order-modal";

export function getColumns(): ColumnDef<OrderWithPayment>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
          className="translate-y-0.5"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
          className="translate-y-0.5"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "trackingId",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tracking Id" />
      ),
      cell: ({ cell }) => {
        return <ItemWithCopyButton text={cell.getValue() as string} />;
      },
    },
    {
      accessorKey: "customerName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
    },
    {
      accessorKey: "phoneNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Phone Number" />
      ),
      cell: ({ cell }) => {
        return <ItemWithCopyButton text={cell.getValue() as string} />;
      },
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
      cell: ({ cell }) => {
        const email = cell.getValue() as string | null;
        if (email) return <ItemWithCopyButton text={email} />;
        return <span className="text-sm text-muted-foreground">N/A</span>;
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ cell }) => {
        const status = cell.getValue() as OrderWithPayment["status"];

        return (
          <Badge
            variant={
              status === "cancelled" || status === "on_hold"
                ? "destructive"
                : status === "delivered"
                  ? "success"
                  : "secondary"
            }
          >
            {capitalize(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "state",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="State" />
      ),
    },
    {
      accessorKey: "city",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="City" />
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Address" />
      ),
      cell: ({ cell }) => {
        const address = cell.getValue() as string;
        return (
          <Tooltip delayDuration={150}>
            <TooltipTrigger>
              <ItemWithCopyButton
                asChild
                text={address}
                className="max-w-[300px] truncate"
              />
            </TooltipTrigger>
            <TooltipContent side={"top"} className="max-w-[300px]">
              {address}
            </TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "subtotal",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subtotal" />
      ),
      cell: ({ cell }) => formatPrice(Number(cell.getValue())),
    },
    {
      accessorKey: "shippingType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Shipping" />
      ),
      cell: ({ cell }) => (
        <Badge variant={"outline"}>
          {capitalize(cell.getValue() as string)}
        </Badge>
      ),
    },
    {
      accessorKey: "paymentStatus",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Payment Status" />
      ),
      cell: ({ cell }) => {
        const paymentStatus =
          cell.getValue() as OrderWithPayment["paymentStatus"];

        return (
          <Badge variant={paymentStatus === "paid" ? "success" : "destructive"}>
            {capitalize(paymentStatus)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Placed At" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "MMM dd, yyyy"),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Updated" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const { onOpen: onEdit } = useEditOrderModal();

        const [showMenu, setShowMenu] = React.useState(false);

        const [showDeleteOrderDialog, setShowDeleteOrderDialog] =
          React.useState(false);

        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        const onUpdate = async (data: UpdateOrdersStatusSchema) => {
          const result = await updateOrdersStatus(data);
          if (!result) return;
          const [_, err] = result;
          if (err) throw err;
        };

        return (
          <>
            <DeleteOrdersDialog
              open={showDeleteOrderDialog}
              onOpenChange={setShowDeleteOrderDialog}
              orders={[row.original]}
              showTrigger={false}
              onSuccess={() => row.toggleSelected(false)}
            />

            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button
                  aria-label="Open menu"
                  variant="ghost"
                  className="flex size-8 p-0 data-[state=open]:bg-muted"
                >
                  <IconDots className="size-4" aria-hidden="true" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem
                  onSelect={() => {
                    onEdit(row.original);
                    setShowMenu(false);
                  }}
                >
                  Edit Order
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  <a href={`/order/${row.original.id}`} target="_blank">
                    Track Order
                  </a>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.status}
                      onValueChange={(value) => {
                        startUpdateTransition(() => {
                          toast.promise(
                            onUpdate({
                              ids: [row.original.id],
                              status: value as OrderWithPayment["status"],
                            }),
                            {
                              loading: "Updating...",
                              success: "Status updated",
                              error: (err) => getErrorMessage(err),
                            },
                          );
                        });

                        setShowMenu(false);
                      }}
                    >
                      {orders.status.enumValues.map((status) => (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          disabled={isUpdatePending}
                        >
                          {capitalize(status)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    Payment Status
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.paymentStatus}
                      onValueChange={(value) => {
                        startUpdateTransition(() => {
                          toast.promise(
                            onUpdate({
                              ids: [row.original.id],
                              paymentStatus:
                                value as OrderWithPayment["paymentStatus"],
                            }),
                            {
                              loading: "Updating...",
                              success: "Payment status updated",
                              error: (err) => getErrorMessage(err),
                            },
                          );
                        });

                        setShowMenu(false);
                      }}
                    >
                      {payments.status.enumValues.map((status) => (
                        <DropdownMenuRadioItem
                          key={status}
                          value={status}
                          disabled={isUpdatePending}
                        >
                          {capitalize(status)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => {
                    setShowMenu(false);
                    setShowDeleteOrderDialog(true);
                  }}
                >
                  Delete
                  <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
      size: 40,
    },
  ];
}
