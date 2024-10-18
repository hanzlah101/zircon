import ky from "ky";
import { useCallback, useMemo } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useCartStore } from "./use-cart-store";

import type { ProductImage } from "@/db/types";
import type { ProductSize } from "@/db/schema";
import type { CartItem } from "@/validators/product.validators";
import type { UseQueryOptions } from "@tanstack/react-query";

export type BagProduct = {
  id: string;
  title: string;
  images: ProductImage[];
  size: ProductSize;
};

export function useBagItems(
  buyNowItem?: CartItem,
  options?: Omit<
    UseQueryOptions<BagProduct[]>,
    "queryKey" | "queryFn" | "placeholderData"
  >,
) {
  const { cart, removeFromCart, changeProductQty } = useCartStore();

  const productWithQty = useCallback(
    (product: BagProduct) => {
      const cartItem = cart.find(
        (item) =>
          item.productId === product.id && item.sizeId === product.size.id,
      );

      return {
        ...product,
        qty: cartItem?.qty || 1,
      };
    },
    [cart],
  );

  const { data, ...query } = useQuery({
    queryKey: [
      "cart-products",
      buyNowItem,
      cart.map((c) => ({
        productId: c.productId,
        sizeId: c.sizeId,
      })),
    ],
    queryFn: async () => {
      const items = buyNowItem ? [buyNowItem] : cart;

      if (!items.length) return [];

      const searchParams = new URLSearchParams();
      items.forEach((item, index) => {
        searchParams.append(`items[${index}]`, JSON.stringify(item));
      });

      const { products } = await ky
        .get("/api/products/cart", { searchParams })
        .json<{
          products: BagProduct[];
        }>();

      if ((buyNowItem && !products.length) || !products[0].size.stock) {
        throw new Error("You've selected an unavailable product");
      }

      if (!buyNowItem) {
        const notFoundItems = cart.filter(
          (item) =>
            !products.some(
              (product) =>
                product.id === item.productId &&
                product.size.id === item.sizeId,
            ),
        );

        if (notFoundItems.length > 0) {
          notFoundItems.map((item) => removeFromCart(item));
        }

        const underStockItems = products.filter((product) => {
          const { qty } = productWithQty(product);
          return qty > product.size.stock && product.size.stock > 0;
        });

        if (underStockItems.length > 0) {
          underStockItems.forEach((product) => {
            changeProductQty({
              productId: product.id,
              sizeId: product.size.id,
              qty: product.size.stock,
            });
          });
        }
      }

      return products;
    },
    placeholderData: keepPreviousData,
    ...options,
  });

  const { inStockItems, outOfStockItems } = useMemo(() => {
    if (!data || !data.length)
      return {
        inStockItems: [],
        outOfStockItems: [],
      };

    const inStockItems = data.filter((product) => {
      if (!!buyNowItem) {
        return product.size.stock > 0;
      }

      return cart.some(
        (cartItem) =>
          cartItem.productId === product.id &&
          cartItem.sizeId === product.size?.id &&
          cartItem.qty > 0 &&
          product.size.stock > 0,
      );
    });

    const outOfStockItems = data.filter((product) => {
      if (!!buyNowItem) {
        return !product.size.stock;
      }

      return cart.some(
        (cartItem) =>
          cartItem.productId === product.id &&
          cartItem.sizeId === product.size?.id &&
          !product.size.stock,
      );
    });

    return { inStockItems, outOfStockItems };
  }, [data, cart, buyNowItem]);

  return {
    ...query,
    data,
    productWithQty,
    inStockItems,
    outOfStockItems,
  };
}
