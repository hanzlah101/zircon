"use client";

import * as React from "react";
import { products, type Product } from "@/db/schema";
import { type DataTableFilterField } from "@/lib/types";

import { useDataTable } from "@/hooks/use-data-table";
import { DataTable } from "@/app/dashboard/_components/data-table";
import { DataTableToolbar } from "@/app/dashboard/_components/data-table/data-table-toolbar";

import type { getDashboardProducts } from "@/queries/product.queries";

import { getColumns } from "./products-table-columns";
import { ProductsTableFloatingBar } from "./products-table-floating-bar";
import { ProductsTableToolbarActions } from "./products-table-toolbar-actions";
import { capitalize } from "@/lib/utils";
import {
  CATEGORIES,
  getProductLabelIcon,
  getProductStatusIcon,
} from "@/lib/constants";

interface ProductsTableProps {
  productsPromise: ReturnType<typeof getDashboardProducts>;
}

export function ProductsTable({ productsPromise }: ProductsTableProps) {
  const { data, pageCount } = React.use(productsPromise);

  const columns = React.useMemo(() => getColumns(), []);
  const filterFields: DataTableFilterField<Product>[] = [
    {
      label: "Status",
      value: "status",
      options: products.status.enumValues.map((status) => ({
        label: capitalize(status),
        value: status,
        icon: getProductStatusIcon(status),
        withCount: true,
      })),
    },
    {
      label: "Label",
      value: "label",
      options: products.label.enumValues.map((label) => ({
        label: capitalize(label),
        value: label,
        icon: getProductLabelIcon(label),
        withCount: true,
      })),
    },
    {
      label: "Category",
      value: "category",
      options: CATEGORIES.map((category) => ({
        label: category,
        value: category,
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
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
    getRowId: (originalRow, index) => `${originalRow.id}-${index}`,
    shallow: false,
    clearOnDefault: true,
  });

  return (
    <DataTable
      table={table}
      floatingBar={<ProductsTableFloatingBar table={table} />}
    >
      <DataTableToolbar table={table} filterFields={filterFields}>
        <ProductsTableToolbarActions table={table} />
      </DataTableToolbar>
    </DataTable>
  );
}
