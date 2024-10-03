import { CheckoutProducts } from "./_components/checkout-products";

export const runtime = "edge";

export default function page() {
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-5 pt-12 lg:grid-cols-[60%_40%] xl:grid-cols-[65%_35%]">
        <div></div>
        <CheckoutProducts />
      </div>
    </div>
  );
}
