"use server";

import { db } from "@/db";
import { orderItems, orders, payments, productSizes } from "@/db/schema";
import { createServerAction, ZSAError } from "zsa";
import { validateRequest } from "@/lib/auth/validate-request";
import {
  cancelOrderSchema,
  orderSchema,
  trackOrderSchema,
  updateOrdersStatusSchema,
} from "@/validators/order.validators";

import { cartItemsSchema } from "@/validators/product.validators";
import { and, eq, gt, inArray, type SQL, sql } from "drizzle-orm";
import { SHIPPING_PRICES, type ShippingPrice } from "@/lib/constants";
import { createDate, TimeSpan } from "oslo";
import { createId } from "@paralleldrive/cuid2";
import { alphabet, generateRandomString } from "oslo/crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import { idSchema, idsSchema } from "@/validators/common.validators";
import { updateStatus } from "./order.service";
import { adminProcedure } from "@/lib/actions.procedures";

export const createOrder = createServerAction()
  .input(orderSchema.extend({ items: cartItemsSchema.shape.items }))
  .onError(console.log)
  .handler(async ({ input }) => {
    const { user } = await validateRequest();

    const orderId = createId();
    const trackingId = generateRandomString(12, alphabet("0-9"));

    const { items, paymentMethod, ...values } = input;

    await db.transaction(async (tx) => {
      const sizeIds = items.map(({ sizeId }) => sizeId);

      const sizes = await tx
        .select({
          id: productSizes.id,
          value: productSizes.value,
          price: productSizes.price,
        })
        .from(productSizes)
        .where(
          and(inArray(productSizes.id, sizeIds), gt(productSizes.stock, 0)),
        );

      function getSizeById(sizeId: string) {
        const size = sizes.find((s) => s.id === sizeId);

        if (!size) {
          throw new ZSAError(
            "CONFLICT",
            "You've selected some unavailable products",
          );
        }

        return size;
      }

      const subtotal = items.reduce((acc, curr) => {
        const { price } = getSizeById(curr.sizeId);
        return acc + curr.qty * Number(price);
      }, 0);

      const { amount: shippingFee, date } = SHIPPING_PRICES.find(
        (item) => item.type === input.shippingType,
      ) as ShippingPrice;

      await tx.insert(orders).values({
        ...values,
        id: orderId,
        trackingId,
        estDeliveryDate: createDate(new TimeSpan(date.value, date.format)),
        userId: user?.id,
        events: {
          processing: {
            date: new Date(),
            description: "Your order is on its way",
          },
        },
      });

      const orderItemsValues = items.map((item) => {
        const { price, value } = getSizeById(item.sizeId);

        return {
          orderId,
          price,
          productId: item.productId,
          size: value,
          quantity: item.qty,
        };
      });

      await tx.insert(orderItems).values(orderItemsValues);

      await tx.insert(payments).values({
        orderId,
        method: paymentMethod,
        subtotal: String(subtotal),
        shippingFee: String(shippingFee),
        // TODO: handle discount
      });

      const stockUpdates = items.map((item) => ({
        id: item.sizeId,
        qty: item.qty,
      }));

      const stockSQLChunks: SQL[] = [];

      stockSQLChunks.push(sql`(CASE`);

      for (const update of stockUpdates) {
        stockSQLChunks.push(
          sql`WHEN ${productSizes.id} = ${update.id} THEN GREATEST(stock - ${update.qty}, 0)`,
        );
      }

      stockSQLChunks.push(sql`END)`);
      const finalStockSQL: SQL = sql.join(stockSQLChunks, sql.raw(" "));

      await tx
        .update(productSizes)
        .set({ stock: finalStockSQL })
        .where(inArray(productSizes.id, sizeIds));

      if (paymentMethod === "credit card") {
        // TODO: implement stripe
      }
    });

    // TODO: emails & sms

    revalidateTag("featured-products");

    return { orderId };
  });

export const trackOrder = createServerAction()
  .input(trackOrderSchema)
  .handler(async ({ input }) => {
    const order = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.trackingId, input.trackingId))
      .then((res) => res[0]);

    if (!order) {
      throw new ZSAError("NOT_FOUND", "No order found with this tracking id");
    }

    redirect(`/order/${order.id}`);
  });

export const refreshOrder = createServerAction()
  .input(idSchema)
  .handler(async ({ input }) => revalidatePath(`/order/${input.id}`));

export const cancelOrder = createServerAction()
  .input(cancelOrderSchema)
  .handler(async ({ input }) => {
    const { user } = await validateRequest();
    const { id, reason } = input;

    const where = user
      ? and(eq(orders.id, id), eq(orders.userId, user.id))
      : eq(orders.id, id);

    const order = await db
      .select({
        status: orders.status,
        city: orders.city,
        events: orders.events,
      })
      .from(orders)
      .where(where)
      .then((res) => res[0]);

    if (order.status !== "processing") {
      throw new ZSAError(
        "FORBIDDEN",
        "Order can't be canceled once processed. Please contact support.",
      );
    }

    if (!order) {
      throw new ZSAError("NOT_FOUND", "No order found");
    }

    await updateStatus([{ id, ...order }], "cancelled", reason);
    revalidatePath(`/order/${id}`);
  });

export const deleteOrders = adminProcedure
  .createServerAction()
  .input(idsSchema)
  .handler(async ({ input }) => {
    await db.delete(orders).where(inArray(orders.id, input.ids));
    revalidatePath("/dashboard/orders");
  });

export const updateOrdersStatus = adminProcedure
  .createServerAction()
  .input(updateOrdersStatusSchema)
  .handler(async ({ input: { ids, status, paymentStatus } }) => {
    if (status) {
      const data = await db
        .select({
          id: orders.id,
          status: orders.status,
          city: orders.city,
          events: orders.events,
        })
        .from(orders)
        .where(inArray(orders.id, ids));

      await updateStatus(data, status);
    }

    if (paymentStatus) {
      const where =
        ids.length === 1
          ? eq(payments.orderId, ids[0])
          : inArray(payments.orderId, ids);

      await db.update(payments).set({ status: paymentStatus }).where(where);
    }

    revalidatePath("/dashboard/orders");
  });
