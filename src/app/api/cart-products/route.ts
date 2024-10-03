import { getCartProducts } from "@/queries/products";
import { cartItemsSchema } from "@/validators/product.validators";
import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const parseCartItems = (url: URL): unknown[] => {
  const items = [];
  for (const [key, value] of url.searchParams.entries()) {
    if (key.startsWith("items[")) {
      try {
        items.push(JSON.parse(value));
      } catch (error) {
        console.error(`Failed to parse item: ${value}`, error);
      }
    }
  }

  return items;
};

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const items = parseCartItems(url);

    const { items: validatedItems } = cartItemsSchema.parse({ items });

    const products = await getCartProducts(validatedItems);

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error processing cart request:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid cart data", errors: error.errors },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
