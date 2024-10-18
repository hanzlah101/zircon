"use client";

import { type Product } from "@/db/schema";
import { IconDownload } from "@tabler/icons-react";
import { type Table } from "@tanstack/react-table";

import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { DeleteProductsDialog } from "./delete-products-dialog";

interface ProductsTableToolbarActionsProps {
  table: Table<Product>;
}

export function ProductsTableToolbarActions({
  table,
}: ProductsTableToolbarActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 ? (
        <DeleteProductsDialog
          onSuccess={() => table.toggleAllRowsSelected(false)}
          products={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
        />
      ) : null}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportTableToCSV(table, {
            filename: "products",
            excludeColumns: ["select", "actions", "images"],
            onlySelected: !!selectedRows.length,
          });
        }}
      >
        <IconDownload className="mr-2 size-4" aria-hidden="true" />
        Export
      </Button>
    </div>
  );
}
