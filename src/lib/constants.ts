import { env } from "@/env";

export const SITE_URL = env.NEXT_PUBLIC_SITE_URL;

export const ROUTES = {
  signIn: "/?modal=login",
  signUp: "/?modal=signup",
  verifyEmail: "/?modal=verify-otp",
  resetPassword: "/?modal=reset-password",
  afterSignIn: "/",
  afterAdminSignIn: "/dashboard",
} as const;

export const CATEGORIES = [
  "Men's Fragrances",
  "Women's Fragrances",
  "Unisex Fragrances",
  "Eau de Parfums",
  "Eau de Toilettes",
  "Colognes",
  "Perfume Oils",
  "Body Sprays",
  "Floral Fragrances",
  "Woody Fragrances",
  "Oriental Fragrances",
  "Citrus Fragrances",
  "Fruity Fragrances",
  "Spicy Fragrances",
  "Fresh Fragrances",
  "Aquatic Fragrances",
  "Green Fragrances",
  "Gourmand Fragrances",
  "Leather Fragrances",
  "Musk Fragrances",
  "Niche Perfumes",
  "Celebrity Fragrances",
  "Natural and Organic Fragrances",
  "Alcohol-Free Fragrances",
  "Travel-Size Fragrances",
  "Fragrance Gift Sets",
  "Seasonal Collections",
  "Limited Editions",
  "Vintage Perfumes",
  "Home Fragrances",
  "Fragrance Accessories",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const MAX_FILE_SIZE = 1024 * 1024 * 5;
export const MAX_PRODUCT_IMAGES = 10;

export const DEFAULT_SHIPPING_PRICE = 200;
