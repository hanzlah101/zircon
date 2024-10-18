"use client";

import { IconDownload } from "@tabler/icons-react";
import { type Table } from "@tanstack/react-table";

import { exportTableToCSV } from "@/lib/export";
import { Button } from "@/components/ui/button";
import { DeleteOrdersDialog } from "./delete-orders-dialog";
import { type OrderWithPayment } from "@/db/types";

interface OrdersTableToolbarActionsProps {
  table: Table<OrderWithPayment>;
}

export function OrdersTableToolbarActions({
  table,
}: OrdersTableToolbarActionsProps) {
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <div className="flex items-center gap-2">
      {selectedRows.length > 0 ? (
        <DeleteOrdersDialog
          onSuccess={() => table.toggleAllRowsSelected(false)}
          orders={table
            .getFilteredSelectedRowModel()
            .rows.map((row) => row.original)}
        />
      ) : null}

      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          exportTableToCSV(table, {
            filename: "orders",
            excludeColumns: ["select", "actions"],
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
