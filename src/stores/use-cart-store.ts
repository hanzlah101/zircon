import { CartItem } from "@/validators/product.validators";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type ItemWithoutQty = {
  productId: string;
  sizeId: string;
};

type CartStore = {
  cart: CartItem[];
  addToCart: (item: CartItem & { stock?: number }) => void;
  changeProductQty: (item: CartItem) => void;
  removeFromCart: (item: ItemWithoutQty) => void;
  toggleSelectItem: (item: ItemWithoutQty) => void;
  removeAllProducts: () => void;
  toggleAllSelect: () => void;
};

export const useCartStore = create(
  persist<CartStore>(
    (set) => ({
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingProductIndex = state.cart.findIndex(
            (cartItem) =>
              cartItem.productId === item.productId &&
              cartItem.sizeId === item.sizeId,
          );

          if (existingProductIndex >= 0) {
            const updatedCart = [...state.cart];
            const existingProduct = updatedCart[existingProductIndex];
            const newQty = item.stock
              ? Math.min(existingProduct.qty + item.qty, item.stock)
              : existingProduct.qty + item.qty;

            updatedCart[existingProductIndex] = {
              ...existingProduct,
              qty: newQty,
            };

            return { cart: updatedCart };
          }

          // If the item doesn't exist in the cart, add it as a new entry
          return { cart: [...state.cart, { ...item, qty: item.qty }] };
        }),

      changeProductQty: (item) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === item.productId && i.sizeId === item.sizeId
              ? { ...i, qty: item.qty }
              : i,
          ),
        })),

      removeFromCart: (item) =>
        set((state) => ({
          cart: state.cart.filter(
            (i) =>
              !(i.productId === item.productId && i.sizeId === item.sizeId),
          ),
        })),

      toggleSelectItem: (item) =>
        set((state) => ({
          cart: state.cart.map((i) =>
            i.productId === item.productId && i.sizeId === item.sizeId
              ? { ...i, isSelected: !i.isSelected }
              : i,
          ),
        })),

      removeAllProducts: () =>
        set((state) => ({
          cart: state.cart.filter((item) => !item.isSelected),
        })),

      toggleAllSelect: () =>
        set((state) => {
          const allSelected = state.cart.every((item) => item.isSelected);
          return {
            cart: state.cart.map((item) => ({
              ...item,
              isSelected: !allSelected,
            })),
          };
        }),
    }),
    {
      name: "cart-storage",
    },
  ),
);
