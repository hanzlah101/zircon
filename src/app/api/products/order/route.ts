import { db } from "@/db";
import { orderItems, products } from "@/db/schema";
import { isCuid } from "@paralleldrive/cuid2";
import { eq } from "drizzle-orm";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const orderId = url.searchParams.get("orderId");

    if (!orderId || !isCuid(orderId)) {
      return NextResponse.json(
        { message: "Something went wrong" },
        { status: 400 },
      );
    }

    const data = await db
      .select({
        price: orderItems.price,
        size: orderItems.size,
        quantity: orderItems.quantity,
        product: {
          id: products.id,
          title: products.title,
          images: products.images,
        },
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, orderId));

    return NextResponse.json({ data }, { status: 200 });
  } catch (error) {
    console.error("Error processing order items:", error);

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
