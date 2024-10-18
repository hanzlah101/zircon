import "server-only";

import { db } from "@/db";
import { and, eq, inArray, sql, type SQL } from "drizzle-orm";
import { getOrderEventDescription } from "@/lib/constants";
import type { OrderEvent } from "@/db/types";
import { orderItems, orders, productSizes, type Order } from "@/db/schema";
import { revalidateTag } from "next/cache";

async function updateStock(orderId: string, increment: boolean) {
  const items = await db
    .select({
      productId: orderItems.productId,
      quantity: orderItems.quantity,
      size: orderItems.size,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  if (!items.length) return;

  const sizes = await db
    .select({
      id: productSizes.id,
      productId: productSizes.productId,
      value: productSizes.value,
      stock: productSizes.stock,
    })
    .from(productSizes)
    .where(
      and(
        inArray(
          productSizes.productId,
          items.map((item) => item.productId),
        ),
        inArray(
          productSizes.value,
          items.map((item) => item.size),
        ),
      ),
    );

  if (!sizes.length) return;

  const sqlChunks: SQL[] = [];
  const sizeIds: string[] = [];

  sqlChunks.push(sql`(CASE`);

  const quantityMap = new Map(
    items.map((item) => [`${item.productId}-${item.size}`, item.quantity]),
  );

  for (const size of sizes) {
    const key = `${size.productId}-${size.value}`;
    const quantity = quantityMap.get(key);

    if (quantity === undefined) continue;

    const adjustment = increment ? quantity : -quantity;

    sqlChunks.push(
      sql`WHEN ${productSizes.id} = ${size.id} THEN GREATEST(${productSizes.stock} + ${adjustment}, 0)`,
    );

    sizeIds.push(size.id);
  }

  sqlChunks.push(sql`END)`);

  if (!sizeIds.length) return;

  const finalSQL: SQL = sql.join(sqlChunks, sql.raw(" "));

  await db
    .update(productSizes)
    .set({ stock: finalSQL })
    .where(inArray(productSizes.id, sizeIds));
}

type OrderUpdateInput = {
  id: string;
  status: Order["status"];
  events: OrderEvent;
  city: string;
};

function shouldUpdateStock(
  prevStatus: Order["status"],
  newStatus: Order["status"],
): { shouldUpdate: boolean; increment: boolean } {
  if (prevStatus === newStatus) {
    return { shouldUpdate: false, increment: false };
  }

  if (newStatus === "cancelled") {
    return { shouldUpdate: true, increment: true };
  }

  if (prevStatus === "cancelled") {
    return { shouldUpdate: true, increment: false };
  }

  return { shouldUpdate: false, increment: false };
}

export async function updateStatus(
  prevOrders: OrderUpdateInput[],
  newStatus: Order["status"],
  description?: string,
) {
  let needsRevalidation = false;

  if (prevOrders.length === 1) {
    const order = prevOrders[0];
    const { shouldUpdate, increment } = shouldUpdateStock(
      order.status,
      newStatus,
    );

    const eventDescription =
      description ||
      getOrderEventDescription({
        city: order.city,
        status: newStatus,
      });

    const newEvent = {
      [newStatus]: {
        date: new Date(),
        description: eventDescription,
      },
    };

    const updatedEvents: OrderEvent = {
      ...order.events,
      ...newEvent,
    };

    await db
      .update(orders)
      .set({ status: newStatus, events: updatedEvents })
      .where(eq(orders.id, order.id));

    if (shouldUpdate) {
      await updateStock(order.id, increment);
      needsRevalidation = true;
    }
  } else {
    const orderIds = prevOrders.map((order) => order.id);

    const sqlChunks: SQL[] = [];
    sqlChunks.push(sql`(case`);

    for (const order of prevOrders) {
      const eventDescription =
        description ||
        getOrderEventDescription({
          city: order.city,
          status: newStatus,
        });

      const newEvent = {
        [newStatus]: {
          date: new Date(),
          description: eventDescription,
        },
      };

      const updatedEvents: OrderEvent = {
        ...order.events,
        ...newEvent,
      };

      sqlChunks.push(
        sql`WHEN ${orders.id} = ${order.id} THEN ${JSON.stringify(updatedEvents)}::jsonb`,
      );
    }

    sqlChunks.push(sql`END)`);

    const eventsSQL = sql.join(sqlChunks, sql.raw(" "));

    await db
      .update(orders)
      .set({ events: eventsSQL, status: newStatus })
      .where(inArray(orders.id, orderIds));

    const stockUpdates = prevOrders.map((order) => {
      const { shouldUpdate, increment } = shouldUpdateStock(
        order.status,
        newStatus,
      );
      if (shouldUpdate) {
        needsRevalidation = true;
        return updateStock(order.id, increment);
      }
      return null;
    });

    await Promise.all(
      stockUpdates.filter((update): update is Promise<void> => update !== null),
    );
  }

  if (needsRevalidation) {
    revalidateTag("featured-products");
  }
}
