import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem } from "@/validators/product.validators";

type ItemWithoutQty = {
  productId: string;
  sizeId: string;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (item: CartItem & { stock: number }) => void;
  changeProductQty: (item: CartItem) => void;
  removeFromCart: (item: ItemWithoutQty) => void;
  removeAllProducts: () => void;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingItemIndex = state.cart.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.sizeId === item.sizeId,
          );

          if (existingItemIndex > -1) {
            const updatedCart = [...state.cart];
            const newQty = Math.min(
              updatedCart[existingItemIndex].qty + item.qty,
              item.stock,
            );
            updatedCart[existingItemIndex] = {
              productId: item.productId,
              sizeId: item.sizeId,
              qty: newQty,
            };
            return { cart: updatedCart };
          } else {
            const newItem: CartItem = {
              productId: item.productId,
              sizeId: item.sizeId,
              qty: Math.min(item.qty, item.stock),
            };
            return { cart: [...state.cart, newItem] };
          }
        }),

      changeProductQty: (item) =>
        set((state) => {
          const updatedCart = state.cart.map((cartItem) =>
            cartItem.productId === item.productId &&
            cartItem.sizeId === item.sizeId
              ? { ...cartItem, qty: item.qty < 1 ? 1 : item.qty }
              : cartItem,
          );
          return { cart: updatedCart };
        }),

      removeFromCart: (item) =>
        set((state) => ({
          cart: state.cart.filter(
            (cartItem) =>
              !(
                cartItem.productId === item.productId &&
                cartItem.sizeId === item.sizeId
              ),
          ),
        })),

      removeAllProducts: () => set({ cart: [] }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
