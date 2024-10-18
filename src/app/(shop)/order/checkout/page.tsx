import { validateRequest } from "@/lib/auth/validate-request";
import { CheckoutForm } from "./_components/checkout-form";
import { CheckoutProducts } from "./_components/checkout-products";
import { CheckoutWrapper } from "./_components/checkout-wrapper";
import { getLastOrder } from "@/queries/order.queries";

export default async function CheckoutPage() {
  const { user } = await validateRequest();
  const lastOrder = await getLastOrder(user?.email);

  return (
    <CheckoutWrapper>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_320px] lg:grid-cols-3">
        <CheckoutForm user={user} lastOrder={lastOrder} />
        <CheckoutProducts />
      </div>
    </CheckoutWrapper>
  );
}
