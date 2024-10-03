/* eslint-disable @typescript-eslint/no-explicit-any */
import { createId } from "@paralleldrive/cuid2";
import { products, productSizes, reviews, users } from "./schema";
import { CATEGORIES } from "@/lib/constants";
import { db } from ".";

type TX = any;

function randomDate() {
  return new Date(Date.now() + Math.random() * 1000 * 60 * 60 * 24 * 365);
}

async function seedUsers(tx: TX) {
  const usersData = Array(10)
    .fill(0)
    .map((_, i) => ({
      id: createId(),
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      emailVerified: true,
      createdAt: randomDate(),
      updatedAt: randomDate(),
    }));

  await tx.insert(users).values(usersData);
  return usersData;
}

const userId = "euu3ezt6lgg4b4yohrcvxcuc";

type Product = {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  price: number;
  rating: number;
  stock: number;
};

async function seedProducts(tx: TX) {
  const data: { products: Product[] } = await fetch(
    "https://dummyjson.com/products/category/fragrances",
  ).then((res) => res.json());

  const productsData = data.products.map((product) => {
    const productId = createId();

    return {
      userId,
      id: productId,
      title: product.title,
      description: `<p>${product.description}</p>`,
      category: CATEGORIES[0],
      createdAt: randomDate(),
      updatedAt: randomDate(),
      price: product.price.toFixed(2),
      stock: product.stock,
      rating: product.rating.toFixed(1),
      tags: product.tags,
      status: "active",
      label: "featured",
      images: product.images.map((url, index) => ({
        url,
        name: product.title,
        order: index,
        key: createId(),
      })),
    } as const;
  });

  const productSizesData = productsData.map((product) => ({
    id: createId(),
    productId: product.id,
    value: 12,
    price: product.price,
    stock: product.stock,
    createdAt: randomDate(),
    updatedAt: randomDate(),
  }));

  console.log("INSERTING PRODUCTS...");
  await tx.insert(products).values(productsData);
  await tx.insert(productSizes).values(productSizesData);

  return productsData;
}

async function seedReviews(
  tx: TX,
  usersData: { id: string }[],
  productsData: { id: string }[],
) {
  const reviewsData = [];

  for (const user of usersData) {
    for (const product of productsData) {
      // Generate a random rating between 1 and 5
      const rating = Math.floor(Math.random() * 5) + 1;

      // Generate a random comment
      const comment = `Review for ${product.id} by ${user.id}`;

      const reviewData = {
        id: createId(),
        userId: user.id,
        productId: product.id,
        rating,
        body: comment,
        createdAt: randomDate(),
        updatedAt: randomDate(),
      };

      reviewsData.push(reviewData);
    }
  }

  // Insert all reviews at once
  await tx.insert(reviews).values(reviewsData);

  return reviewsData;
}

async function seed() {
  await db.transaction(async (tx) => {
    console.log("SEEDING USERS...");
    const usersData = await seedUsers(tx);
    console.log("SEEDING PRODUCTS...");
    const productsData = await seedProducts(tx);
    console.log("SEEDING REVIEWS...");
    await seedReviews(tx, usersData, productsData);
  });
}

seed()
  .catch(console.log)
  .finally(() => process.exit(0));
