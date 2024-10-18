import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { Suspense } from "react";
import { OrdersTable } from "./_components/orders-table";
import { getOrders } from "@/queries/order.queries";
import { DataTableSkeleton } from "../_components/data-table/data-table-skeleton";
import { getOrdersSchema } from "@/validators/order.validators";
import { DateRangePicker } from "../_components/date-range-picker";
import { EditOrderModal } from "./_components/edit-order-modal";

type OrdersPageProps = {
  searchParams: unknown;
};

export default function OrdersPage({ searchParams }: OrdersPageProps) {
  const input = getOrdersSchema.parse(searchParams);
  const ordersPromise = getOrders(input);

  return (
    <>
      <EditOrderModal />
      <div className="w-full">
        <Breadcrumb className="mb-6 hidden sm:block">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href={"/dashboard"}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator />

            <BreadcrumbItem>
              <BreadcrumbPage>Orders</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h1 className="font-heading text-3xl font-semibold">Orders</h1>

            <DateRangePicker
              triggerSize="sm"
              triggerClassName="ml-auto w-fit min-w-56 sm:min-w-60"
              align="end"
              shallow={false}
            />
          </div>

          <Suspense
            fallback={
              <DataTableSkeleton
                columnCount={5}
                filterableColumnCount={2}
                cellWidths={["10rem", "40rem", "12rem", "12rem", "8rem"]}
                shrinkZero
              />
            }
          >
            <OrdersTable ordersPromise={ordersPromise} />
          </Suspense>
        </div>
      </div>
    </>
  );
}
