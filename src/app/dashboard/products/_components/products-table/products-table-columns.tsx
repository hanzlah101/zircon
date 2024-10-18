"use client";

import * as React from "react";
import Link from "next/link";
import { capitalize } from "@/lib/utils";
import { products, type Product } from "@/db/schema";
import { IconDots } from "@tabler/icons-react";
import { type ColumnDef } from "@tanstack/react-table";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { DataTableColumnHeader } from "@/app/dashboard/_components/data-table/data-table-column-header";
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

import Image from "next/image";
import { toast } from "sonner";
import { UpdateProductSchema } from "@/validators/product.validators";
import { updateProduct } from "@/actions/product/product.actions";
import { getErrorMessage } from "@/lib/errors";
import { DeleteProductsDialog } from "./delete-products-dialog";
import type { ProductImage } from "@/db/types";

export function getColumns(): ColumnDef<Product>[] {
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
      accessorKey: "images",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Image" />
      ),
      cell: ({ cell }) => {
        const image = (cell.getValue() as ProductImage[]).sort(
          (a, b) => a.order - b.order,
        )[0];

        return (
          <div className="relative size-24 shrink-0 overflow-hidden rounded-lg bg-accent">
            <Image fill objectFit="cover" src={image.url} alt={image.name} />
          </div>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Title" />
      ),
      cell: ({ cell }) => {
        return (
          <span className="max-w-[31.25rem] truncate font-medium">
            {cell.getValue() as string}
          </span>
        );
      },
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: function Cell({ cell, column }) {
        const category = cell.getValue() as string;

        return (
          <span
            className="cursor-pointer text-[13px] font-medium text-foreground/85 hover:underline hover:underline-offset-4"
            onClick={() => column.setFilterValue([category])}
          >
            {category}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ cell }) => {
        const status = cell.getValue() as string;

        return (
          <Badge variant={status === "active" ? "secondary" : "destructive"}>
            {capitalize(status)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "label",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Label" />
      ),
      cell: ({ cell }) => {
        const label = cell.getValue() as string;

        return (
          <Badge variant={label === "none" ? "outline" : "default"}>
            {capitalize(label)}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return Array.isArray(value) && value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ cell }) => format(cell.getValue() as Date, "MMM dd, yyyy"),
    },
    {
      id: "actions",
      cell: function Cell({ row }) {
        const [showMenu, setShowMenu] = React.useState(false);

        const [showDeleteProductDialog, setShowDeleteProductDialog] =
          React.useState(false);

        const [isUpdatePending, startUpdateTransition] = React.useTransition();

        const onUpdate = async (data: UpdateProductSchema) => {
          const result = await updateProduct({
            ...data,
            shouldRedirect: false,
          });
          if (!result) return;
          const [_, err] = result;
          if (err) throw err;
        };

        return (
          <>
            <DeleteProductsDialog
              open={showDeleteProductDialog}
              onOpenChange={setShowDeleteProductDialog}
              products={[row.original]}
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
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/products/edit/${row.original.id}`}>
                    Edit
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Labels</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.label}
                      onValueChange={(value) => {
                        startUpdateTransition(() => {
                          toast.promise(
                            onUpdate({
                              id: row.original.id,
                              label: value as Product["label"],
                            }),
                            {
                              loading: "Updating...",
                              success: "Label updated",
                              error: (err) => getErrorMessage(err),
                            },
                          );
                        });
                      }}
                    >
                      {products.label.enumValues.map((label) => (
                        <DropdownMenuRadioItem
                          key={label}
                          value={label}
                          disabled={isUpdatePending}
                        >
                          {capitalize(label)}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={row.original.status}
                      onValueChange={(value) => {
                        startUpdateTransition(() => {
                          toast.promise(
                            onUpdate({
                              id: row.original.id,
                              status: value as Product["status"],
                            }),
                            {
                              loading: "Updating...",
                              success: "Status updated",
                              error: (err) => getErrorMessage(err),
                            },
                          );
                        });
                      }}
                    >
                      {products.status.enumValues.map((status) => (
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
                    setShowDeleteProductDialog(true);
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
