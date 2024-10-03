import { getProduct } from "@/queries/products";
import { ProductDetails } from "../_components/product-details";

type ProductPageProps = {
  params: {
    productId: string;
  };
};

export default async function ProductPage({ params }: ProductPageProps) {
  const productPromise = getProduct(params.productId);

  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <ProductDetails productPromise={productPromise} />
    </div>
  );
}
