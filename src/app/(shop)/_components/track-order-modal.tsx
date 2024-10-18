"use client";

import { trackOrder } from "@/actions/order/order.actions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { StatusButton } from "@/components/ui/status-button";
import { useServerAction } from "@/hooks/use-server-action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { onFormError } from "@/lib/errors";
import { useTrackOrderModal } from "@/stores/use-track-order-modal";
import {
  TrackOrderSchema,
  trackOrderSchema,
} from "@/validators/order.validators";

export function TrackOrderModal() {
  const { isOpen, onOpenChange, onClose } = useTrackOrderModal();

  const form = useForm<TrackOrderSchema>({
    resolver: zodResolver(trackOrderSchema),
    defaultValues: {
      trackingId: "",
    },
  });

  const {
    mutate: track,
    isPending,
    status,
  } = useServerAction(trackOrder, {
    onError: onFormError(form),
    onSuccess: onClose,
  });

  const onSubmit = form.handleSubmit((values) => track(values));

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="flex flex-col">
        <DialogHeader>
          <DialogTitle>Track your order</DialogTitle>
          <DialogDescription>
            Enter your tracking ID to check your order status. For any issues,
            contact our support team.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <FormError />
          <form onSubmit={onSubmit} className="space-y-3">
            <FormField
              control={form.control}
              name="trackingId"
              disabled={isPending}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking ID</FormLabel>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="Enter your tracking id"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <StatusButton
              type="submit"
              status={status}
              successMessage="Redirecting..."
            >
              Track Order
            </StatusButton>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
