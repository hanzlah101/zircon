import ky from "ky";
import { useQuery } from "@tanstack/react-query";
import { useCartStore } from "./use-cart-store";

import type { ProductImage } from "@/db/types";
import type { ProductSize } from "@/db/schema";
import { useCallback } from "react";

export type BagProduct = {
  id: string;
  title: string;
  images: ProductImage[];
  size: ProductSize;
};

export function useBagItems() {
  const { cart, removeFromCart } = useCartStore();

  const productWithQty = useCallback(
    (product: BagProduct) => {
      const cartItem = cart.find(
        (item) =>
          item.productId === product.id && item.sizeId === product.size.id,
      );

      return {
        ...product,
        qty: cartItem?.qty || 1,
        isSelected: cartItem?.isSelected || false,
      };
    },
    [cart],
  );

  const query = useQuery({
    queryKey: [
      "cart-products",
      cart.map((item) => ({
        productId: item.productId,
        sizeId: item.sizeId,
      })),
    ],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      cart.forEach((item, index) => {
        searchParams.append(`items[${index}]`, JSON.stringify(item));
      });

      const data = await ky.get("/api/cart-products", { searchParams }).json<{
        products: BagProduct[];
      }>();

      cart.forEach((item) => {
        const productIndex = data.products.findIndex(
          (product) =>
            product.id === item.productId && product.size.id === item.sizeId,
        );

        if (productIndex < 0) {
          removeFromCart(item);
        }
      });

      return data.products;
    },
  });

  return { ...query, productWithQty };
}
