import "server-only";

import { db } from "@/db";
import { unstable_noStore as noStore } from "next/cache";
import { orderItems, orders, payments, products } from "@/db/schema";
import {
  and,
  asc,
  count,
  desc,
  eq,
  gte,
  lte,
  or,
  sql,
  type SQL,
} from "drizzle-orm";

import type { OrderWithPayment, ProductImage } from "@/db/types";
import { validateRequest } from "@/lib/auth/validate-request";
import { GetOrdersSchema } from "@/validators/order.validators";
import { filterColumn } from "@/lib/filter-column";
import { DrizzleWhere } from "@/lib/types";

export async function getLastOrder(email?: string) {
  if (!email) return null;

  const lastOrder = await db
    .select({
      email: orders.email,
      customerName: orders.customerName,
      phoneNumber: orders.phoneNumber,
      city: orders.city,
      state: orders.state,
      address: orders.address,
      shippingType: orders.shippingType,
      paymentMethod: payments.method,
    })
    .from(orders)
    .where(eq(orders.email, email))
    .innerJoin(payments, eq(orders.id, payments.orderId))
    .limit(1)
    .orderBy(desc(orders.createdAt))
    .then((res) => res[0]);

  return lastOrder;
}

type OrderItemWithProduct = {
  id: string;
  size: number;
  price: string;
  quantity: number;
  productId: string;
  product: {
    title: string;
    images: ProductImage[];
  };
};

export async function getOrderById(orderId: string) {
  const { user } = await validateRequest();

  const where =
    user && user.role === "customer"
      ? and(eq(orders.id, orderId), eq(orders.userId, user.id))
      : eq(orders.id, orderId);

  const order = await db
    .select({
      id: orders.id,
      email: orders.email,
      trackingId: orders.trackingId,
      customerName: orders.customerName,
      phoneNumber: orders.phoneNumber,
      city: orders.city,
      state: orders.state,
      address: orders.address,
      shippingType: orders.shippingType,
      status: orders.status,
      events: orders.events,
      createdAt: orders.createdAt,
      estDeliveryDate: orders.estDeliveryDate,
      payment: {
        id: payments.id,
        subtotal: payments.subtotal,
        shippingFee: payments.shippingFee,
        taxes: payments.taxes,
        discount: payments.discount,
        status: payments.status,
      },
      items: sql<OrderItemWithProduct[]>`
      json_agg(
        json_build_object(
          'id', ${orderItems.id},
          'size', ${orderItems.size},
          'price', ${orderItems.price},
          'quantity', ${orderItems.quantity},
          'productId', ${orderItems.productId},
          'product', json_build_object(
            'title', ${products.title},
            'images', ${products.images}
          )
        )
      )
    `.as("items"),
    })
    .from(orders)
    .where(where)
    .innerJoin(payments, eq(orders.id, payments.orderId))
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(products, eq(orderItems.productId, products.id))
    .groupBy(orders.id, payments.id)
    .then((res) => res[0]);

  return order;
}

export async function getOrders(input: GetOrdersSchema) {
  noStore();

  try {
    const offset = (input.page - 1) * input.per_page;

    const [column, order] = (input.sort?.split(".").filter(Boolean) ?? [
      "createdAt",
      "desc",
    ]) as [keyof OrderWithPayment | undefined, "asc" | "desc" | undefined];

    const fromDate = input.from
      ? new Date(new Date(input.from).setHours(0, 0, 0, 0))
      : undefined;

    const toDate = input.to
      ? new Date(new Date(input.to).setHours(23, 59, 59, 999))
      : undefined;

    const expressions: (SQL<unknown> | undefined)[] = [
      input.q
        ? or(
            filterColumn({
              column: orders.customerName,
              value: input.q,
            }),
            filterColumn({
              column: orders.email,
              value: input.q,
            }),
            filterColumn({
              column: orders.phoneNumber,
              value: input.q,
            }),
            filterColumn({
              column: orders.state,
              value: input.q,
            }),
            filterColumn({
              column: orders.city,
              value: input.q,
            }),
            filterColumn({
              column: orders.address,
              value: input.q,
            }),
            filterColumn({
              column: orders.trackingId,
              value: input.q,
            }),
          )
        : undefined,
      !!input.status
        ? filterColumn({
            column: orders.status,
            value: input.status,
            isSelectable: true,
          })
        : undefined,
      !!input.shippingType
        ? filterColumn({
            column: orders.shippingType,
            value: input.shippingType,
            isSelectable: true,
          })
        : undefined,
      !!input.paymentStatus
        ? filterColumn({
            column: payments.status,
            value: input.paymentStatus,
            isSelectable: true,
          })
        : undefined,
      fromDate ? gte(orders.createdAt, fromDate) : undefined,
      toDate ? lte(orders.createdAt, toDate) : undefined,
    ].filter((e) => e !== undefined);

    const where: DrizzleWhere<OrderWithPayment> =
      !input.operator || input.operator === "and"
        ? and(...expressions)
        : or(...expressions);

    const orderBy = () => {
      const orderFn = order === "asc" ? asc : desc;

      switch (column) {
        case "paymentMethod":
          return orderFn(payments.method);

        case "paymentStatus":
          return orderFn(payments.status);

        case "subtotal":
        case "shippingFee":
        case "discount":
        case "taxes":
          return orderFn(payments[column]);
        default:
          if (column && column in orders) return orderFn(orders[column]);
          return desc(orders.id);
      }
    };

    const { data, total } = await db.transaction(async (tx) => {
      const data = await tx
        .select({
          order: orders,
          paymentMethod: payments.method,
          paymentStatus: payments.status,
          subtotal: payments.subtotal,
          shippingFee: payments.shippingFee,
          taxes: payments.taxes,
          discount: payments.discount,
        })
        .from(orders)
        .where(where)
        .innerJoin(payments, eq(orders.id, payments.orderId))
        .offset(offset)
        .limit(input.per_page)
        .orderBy(orderBy())
        .then((res) =>
          res.map(({ order, ...rest }) => ({ ...order, ...rest })),
        );

      const total = await tx
        .select({ count: count() })
        .from(orders)
        .where(where)
        .innerJoin(payments, eq(orders.id, payments.orderId))
        .execute()
        .then((res) => res[0]?.count ?? 0);

      return { data, total };
    });

    const pageCount = Math.ceil(total / input.per_page);
    return { data, pageCount };
  } catch {
    return { data: [], pageCount: 0 };
  }
}
