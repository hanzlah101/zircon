"use client";

import { useCartStore } from "@/stores/use-cart-store";
import { notFound, useSearchParams } from "next/navigation";

type CheckoutWrapperProps = {
  children: React.ReactNode;
};

export function CheckoutWrapper({ children }: CheckoutWrapperProps) {
  const { cart } = useCartStore();
  const searchParams = useSearchParams();

  const mode = (searchParams.get("mode") || "cart") as "cart" | "buy-now";
  const productId = searchParams.get("productId");
  const sizeId = searchParams.get("sizeId");
  const qty = parseInt(searchParams.get("qty") || "1", 10);

  if (mode === "cart" && !cart.length) notFound();

  if (mode === "buy-now") {
    if (!productId || !sizeId || !qty) notFound();
  }

  return <div className="mx-auto max-w-screen-xl px-4 py-6">{children}</div>;
}
