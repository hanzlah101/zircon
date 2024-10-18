"use client";

import * as React from "react";
import { type DataTableFilterField } from "@/lib/types";

import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/app/dashboard/_components/data-table";
import { DataTableToolbar } from "@/app/dashboard/_components/data-table/data-table-toolbar";

import { getColumns } from "./orders-table-columns";
import { OrdersTableFloatingBar } from "./orders-table-floating-bar";
import { OrdersTableToolbarActions } from "./orders-table-toolbar-actions";
import type { getOrders } from "@/queries/order.queries";
import { OrderWithPayment } from "@/db/types";
import { orders, payments } from "@/db/schema";
import { capitalize } from "@/lib/utils";
import { useEditOrderModal } from "@/stores/use-edit-order-modal";

interface OrdersTableProps {
  ordersPromise: ReturnType<typeof getOrders>;
}

export function OrdersTable({ ordersPromise }: OrdersTableProps) {
  const { data, pageCount } = React.use(ordersPromise);
  const { onOpen: onEdit } = useEditOrderModal();

  const columns = React.useMemo(() => getColumns(), []);

  const filterFields: DataTableFilterField<OrderWithPayment>[] = [
    {
      label: "Status",
      value: "status",
      options: orders.status.enumValues.map((status) => ({
        label: capitalize(status),
        value: status,
        withCount: true,
      })),
    },
    {
      label: "Payment",
      value: "paymentStatus",
      options: payments.status.enumValues.map((status) => ({
        label: capitalize(status),
        value: status,
        withCount: true,
      })),
    },
    {
      label: "Shipping",
      value: "shippingType",
      options: orders.shippingType.enumValues.map((shipping) => ({
        label: capitalize(shipping),
        value: shipping,
        withCount: true,
      })),
    },
  ];

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    filterFields,
    initialState: {
      sorting: [{ id: "updatedAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <DataTable
      table={table}
      onCellClick={onEdit}
      floatingBar={<OrdersTableFloatingBar table={table} />}
    >
      <DataTableToolbar table={table} filterFields={filterFields}>
        <OrdersTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  );
}
