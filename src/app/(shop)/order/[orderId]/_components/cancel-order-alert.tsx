"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useServerAction } from "@/hooks/use-server-action";
import { getErrorMessage } from "@/lib/errors";
import { cancelOrder } from "@/actions/order/order.actions";
import { useParams } from "next/navigation";
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

import { ORDER_CANCEL_REASONS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function CancelOrderAlert() {
  const [reason, setReason] = useState<string>(ORDER_CANCEL_REASONS[0]);
  const [open, setOpen] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const { orderId }: { orderId: string } = useParams();

  const { mutate: cancel, status } = useServerAction(cancelOrder, {
    onError: (err) => toast.error(getErrorMessage(err)),
    onSuccess: () => setOpen(false),
  });

  useEffect(() => {
    if (reason === "Other" && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [reason]);

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        <Button variant={"outline"} disabled={status === "pending"}>
          Cancel Order
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Your order will be cancelled & this action can&apos;t be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <Select value={reason} onValueChange={setReason}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a reason" />
          </SelectTrigger>
          <SelectContent>
            {ORDER_CANCEL_REASONS.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {reason === "Other" ? (
          <Input
            autoFocus
            ref={inputRef}
            placeholder="Why you want to cancel the order"
          />
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <AlertDialogAction
            status={status}
            successMessage="Cancelled"
            className="w-[140px]"
            onClick={() => {
              cancel({
                id: orderId,
                reason: inputRef.current?.value || reason,
              });
            }}
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
