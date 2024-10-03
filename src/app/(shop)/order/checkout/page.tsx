import { validateRequest } from "@/lib/auth/validate-request";
import { CheckoutForm } from "./_components/checkout-form";
import { CheckoutProducts } from "./_components/checkout-products";

export default async function page() {
  const { user } = await validateRequest();
  return (
    <div className="mx-auto max-w-screen-xl px-4 py-8 md:py-12">
      <div className="grid grid-cols-1 gap-5 pt-12 lg:grid-cols-[60%_40%] xl:grid-cols-[65%_35%]">
        <CheckoutForm user={user} />
        <CheckoutProducts />
      </div>
    </div>
  );
}
