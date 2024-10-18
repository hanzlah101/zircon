"use client";

import { deleteProducts } from "@/actions/product/product.actions";
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
import type { Product } from "@/db/schema";
import { useControllableState } from "@/hooks/use-controllable-state";
import { useServerAction } from "@/hooks/use-server-action";
import { getErrorMessage } from "@/lib/errors";
import { IconTrash } from "@tabler/icons-react";
import type { Row } from "@tanstack/react-table";
import { toast } from "sonner";

interface DeleteProductsDialogProps
  extends React.ComponentPropsWithoutRef<typeof AlertDialog> {
  products: Row<Product>["original"][];
  showTrigger?: boolean;
  onSuccess?: () => void;
}

export function DeleteProductsDialog({
  products,
  onSuccess,
  showTrigger = true,
  ...props
}: DeleteProductsDialogProps) {
  const [open, setOpen] = useControllableState({
    prop: props.open,
    onChange: props.onOpenChange,
  });

  const { mutate: onDelete, status } = useServerAction(deleteProducts, {
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
            Delete ({products.length})
          </Button>
        </AlertDialogTrigger>
      ) : null}

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          {products.length === 1 ? (
            <AlertDialogDescription>
              Product{" "}
              <span className="text-foreground">{products[0].title}</span> will
              be deleted permanently! This action can&apos;t be undone
            </AlertDialogDescription>
          ) : (
            <AlertDialogDescription>
              All the selected products will be deleted permanently! This action
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
            onClick={() => onDelete({ ids: products.map(({ id }) => id) })}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
