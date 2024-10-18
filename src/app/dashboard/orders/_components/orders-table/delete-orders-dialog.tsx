"use client";

import { deleteOrders } from "@/actions/order/order.actions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { OrderWithPayment } from "@/db/types";

import { useControllableState } from "@/hooks/use-controllable-state";
import { useServerAction } from "@/hooks/use-server-action";
import { getErrorMessage } from "@/lib/errors";
import { IconTrash } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";

interface DeleteOrdersDialogProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialog> {
  orders: Row<OrderWithPayment>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteOrdersDialog({
  orders,
  onSuccess,
  showTrigger = true,
  ...props
}: DeleteOrdersDialogProps) {
  const [open, setOpen] = useControllableState({
    prop: props.open,
    onChange: props.onOpenChange,
  });

  const { mutate: onDelete, status } = useServerAction(deleteOrders, {
    onError: (err) => toast.error(getErrorMessage(err)),
    onSuccess: () => {
      setOpen(false);
      onSuccess?.();
    },
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      {showTrigger ? (
        <AlertDialogTrigger asChild>
          <Button variant={"destructive"} size={"sm"}>
            <IconTrash className="mr-2 size-[18px]" />
            Delete ({orders.length})
          </Button>
        </AlertDialogTrigger>
      ) : null}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {orders.length === 1 ? (
            <AlertDialogDescription>
              Order{" "}
              <span className="text-foreground">{orders[0].trackingId}</span>{" "}
              will be deleted permanently! This action can&apos;t be undone
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription>
              All the selected orders will be deleted permanently! This action
              can&apos;t be undone
            </AlertDialogDescription>
          )}
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={status === "pending"}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            status={status}
            successMessage="Deleted"
            className="w-auto min-w-[100px]"
            onClick={() => onDelete({ ids: orders.map(({ id }) => id) })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
