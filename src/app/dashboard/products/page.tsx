import Link from "next/link";
import { Suspense } from "react";
import { IconPlus } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { getDashboardProducts } from "@/queries/product.queries";
import { ProductsTable } from "./_components/products-table";
import { getDashboardProductsSchema } from "@/validators/product.validators";
import { DataTableSkeleton } from "../_components/data-table/data-table-skeleton";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { DateRangePicker } from "../_components/date-range-picker";

type ProductsPageProps = {
  searchParams: unknown;
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  const input = getDashboardProductsSchema.parse(searchParams);
  const productsPromise = getDashboardProducts(input);

  return (
    <div className="w-full">
      <Breadcrumb className="mb-6 hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={"/dashboard"}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Products</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-4 flex items-center justify-between">
        <h1 className="font-heading text-3xl font-semibold">Products</h1>
        <Button asChild size={"sm"} variant={"outline"}>
          <Link href={"/dashboard/products/create"}>
            <IconPlus className="mr-2 size-[18px]" />
            Create product
          </Link>
        </Button>
      </div>

      <DateRangePicker
        triggerSize="sm"
        triggerClassName="ml-auto w-fit min-w-56 sm:min-w-60 mb-4"
        align="end"
        shallow={false}
      />

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={4}
            filterableColumnCount={3}
            cellWidths={["", "20rem", "7rem", "7rem"]}
            shrinkZero
            hasImage
          />
        }
      >
        <ProductsTable productsPromise={productsPromise} />
      </Suspense>
    </div>
  );
}
