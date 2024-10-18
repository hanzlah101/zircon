import { orderStatusEnum, type Payment, type Order } from "./schema";

export type ProductImage = {
  url: string;
  key: string;
  name: string;
  order: number;
};

export type OrderEvent = {
  [key in (typeof orderStatusEnum.enumValues)[number]]?: {
    date: Date;
    description: string;
  };
};

export type OrderWithPayment = Order & {
  paymentMethod: Payment["method"];
  paymentStatus: Payment["status"];
  subtotal: string;
  shippingFee: string;
  taxes: string;
  discount: string | null;
};
