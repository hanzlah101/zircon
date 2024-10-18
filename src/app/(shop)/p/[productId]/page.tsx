import { getProductById } from "@/queries/product.queries";
import { ProductDetails } from "../_components/product-details";
import { notFound } from "next/navigation";

type ProductPageProps = {
  params: {
    productId: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductById(params.productId);

  if (!product) notFound();

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-6">
      <ProductDetails product={product} />
    </div>
  );
}
