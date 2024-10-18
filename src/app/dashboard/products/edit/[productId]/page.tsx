import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getEditProduct } from "@/queries/product.queries";
import { notFound } from "next/navigation";
import { ProductForm } from "../../_components/product-form";

type EditProductPageProps = {
  params: {
    productId: string;
  };
};

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  const product = await getEditProduct(params.productId);

  if (!product) return notFound();

  return (
    <div className="w-full">
      <Breadcrumb className="mb-6 hidden sm:block">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href={"/dashboard"}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbLink href={"/dashboard/products"}>
              Products
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbSeparator />

          <BreadcrumbItem>
            <BreadcrumbPage>Edit Product</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ProductForm
        initialValues={{
          ...product,
          description: product.description || undefined,
          notes: product.notes || undefined,
        }}
      />
    </div>
  );
}
