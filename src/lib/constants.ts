import { env } from "@/env";

import {
  TruckDeliveryIcon,
  TruckExpressDeliveryIcon,
} from "@/components/icons/truck-delivery";

import { orderShippingTypeEnum, type Order, type Product } from "@/db/schema";

import {
  IconActivity,
  IconArchive,
  IconBan,
  IconDiamond,
  IconEdit,
  IconTimelineEventPlus,
} from "@tabler/icons-react";

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

export const COUNTRY_CODE = "PK";

export const STATES = [
  "Punjab",
  "Sindh",
  "Balochistan",
  "Khyber Pakhtunkhwa",
  "Azad Kashmir",
  "Gilgit Baltistan",
] as const;

export type ShippingType = (typeof orderShippingTypeEnum.enumValues)[number];

export type ShippingPrice = {
  type: ShippingType;
  amount: number;
  icon: React.ComponentType<React.HTMLAttributes<SVGElement>>;
  time: string;
  date: {
    value: number;
    format: "d" | "h";
  };
};

export const SHIPPING_PRICES: ShippingPrice[] = [
  {
    type: "standard",
    amount: 199,
    time: "3-5 business days",
    icon: TruckDeliveryIcon,
    date: { value: 5, format: "d" },
  },
  {
    type: "express",
    amount: 349,
    time: "36 hours",
    icon: TruckExpressDeliveryIcon,
    date: { value: 36, format: "h" },
  },
];

export const ORDER_CANCEL_REASONS = [
  "Item no longer needed",
  "Found a better price elsewhere",
  "Shipping time was too long",
  "Ordered by mistake",
  "Other",
] as const;

export function getProductStatusIcon(status: Product["status"]) {
  const statusIcons = {
    draft: IconEdit,
    active: IconActivity,
    archived: IconArchive,
  };

  return statusIcons[status];
}

export function getProductLabelIcon(label: Product["label"]) {
  const labelIcons = {
    featured: IconDiamond,
    "new arrival": IconTimelineEventPlus,
    none: IconBan,
  };

  return labelIcons[label];
}

export function getOrderEventDescription(order: {
  city: string;
  status: Order["status"];
}) {
  const descriptions = {
    processing:
      "Your order is currently being processed and will be on its way soon.",
    dispatched: "Your order has been dispatched from Gujranwala.",
    shipped: `Your order has been shipped to ${order.city} & will be delivered soon.`,
    delivered: "Your order has been successfully delivered.",
    cancelled:
      "Your order has been cancelled. Please contact support for further assistance.",
    on_hold:
      "Your order is currently on hold. Please contact support for further assistance.",
  };

  return descriptions[order.status] || null;
}
