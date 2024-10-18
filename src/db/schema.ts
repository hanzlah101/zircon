import {
  boolean,
  decimal,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { CATEGORIES } from "@/lib/constants";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";
import type { OrderEvent, ProductImage } from "./types";

const lifecycleDates = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at")
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "moderator",
  "admin",
]);

export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    email: varchar("email", { length: 255 }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").notNull().default("customer"),
    emailVerified: boolean("email_verified").notNull().default(false),
    ...lifecycleDates,
  },
  (table) => ({
    emailIdx: uniqueIndex("email_idx").on(table.email),
  }),
);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  oauthAccounts: many(oauthAccounts),
  verificationTokens: many(verificationTokens),
  products: many(products),
  reviews: many(reviews),
  orders: many(orders),
}));

export type User = typeof users.$inferSelect;

export const oauthAccounts = pgTable(
  "oauth_accounts",
  {
    provider: text("provider").$type<"google" | "facebook">().notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    accessToken: text("access_token").notNull(),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    userId: varchar("user_id", { length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  },
  (table) => ({
    pk: primaryKey({
      columns: [table.provider, table.providerAccountId],
    }),
  }),
);

export const oAuthAccountRelations = relations(oauthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [oauthAccounts.userId],
    references: [users.id],
  }),
}));

export type OAuthAccount = typeof oauthAccounts.$inferSelect;

export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id").primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    ipAddress: varchar("ip_address", { length: 255 }).notNull(),
    userAgent: varchar("user_agent", { length: 255 }).notNull(),
    userId: varchar("user_id", { length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  },
  (table) => ({
    userIdIdx: index("session_user_id_idx").on(table.userId),
  }),
);

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export type Session = typeof sessions.$inferSelect;

export const verificationTokenTypeEnum = pgEnum("verification_token_type", [
  "verify_email",
  "reset_password",
]);

export const verificationTokens = pgTable("verification_tokens", {
  id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
  token: varchar("token", { length: 255 }).notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  type: verificationTokenTypeEnum("type").notNull(),
  userId: varchar("user_id", { length: 24 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const verificationTokenRelations = relations(
  verificationTokens,
  ({ one }) => ({
    user: one(users, {
      fields: [verificationTokens.userId],
      references: [users.id],
    }),
  }),
);

export type VerificationToken = typeof verificationTokens.$inferSelect;

export const productStatusEnum = pgEnum("product_status", [
  "draft",
  "archived",
  "active",
]);

export const productLabelEnum = pgEnum("product_label", [
  "featured",
  "new arrival",
  "none",
]);

export const products = pgTable("products", {
  id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
  isDeleted: boolean("is_deleted").default(false),
  category: text("category").notNull().$type<(typeof CATEGORIES)[number]>(),
  images: jsonb("images").array().$type<ProductImage[]>().notNull(),
  tags: varchar("tags", { length: 96 }).array().notNull(),
  status: productStatusEnum("status").notNull().default("draft"),
  label: productLabelEnum("label").notNull().default("none"),
  userId: varchar("user_id", { length: 24 }).references(() => users.id, {
    onDelete: "set null",
  }),
  ...lifecycleDates,
});

export const productRelations = relations(products, ({ one, many }) => ({
  user: one(users, {
    fields: [products.userId],
    references: [users.id],
  }),
  sizes: many(productSizes),
  reviews: many(reviews),
}));

export type Product = typeof products.$inferSelect;

export const productSizes = pgTable(
  "product_sizes",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    value: integer("value").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    compareAtPrice: decimal("compare_at_price", { precision: 10, scale: 2 }),
    stock: integer("stock").notNull(),
    productId: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("product_id_idx").on(table.productId),
  }),
);

export const productSizeRelations = relations(productSizes, ({ one }) => ({
  product: one(products, {
    fields: [productSizes.productId],
    references: [products.id],
  }),
}));

export type ProductSize = typeof productSizes.$inferSelect;

export const reviews = pgTable(
  "reviews",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    rating: integer("rating").notNull(),
    body: text("body").notNull(),
    userId: varchar("user_id", { length: 24 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: varchar("product_id", { length: 24 })
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    ...lifecycleDates,
  },
  (table) => ({
    productIdIdx: index("review_product_id_idx").on(table.productId),
    uniqueProductUser: unique().on(table.productId, table.userId),
  }),
);

export const reviewRelations = relations(reviews, ({ one }) => ({
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
}));

export type Review = typeof reviews.$inferSelect;

export const orderStatusEnum = pgEnum("order_status", [
  "processing",
  "dispatched",
  "shipped",
  "delivered",
  "on_hold",
  "cancelled",
]);

export const orderShippingTypeEnum = pgEnum("order_shipping_type", [
  "standard",
  "express",
]);

export const orders = pgTable(
  "orders",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    trackingId: varchar("tracking_id", { length: 22 }).notNull(),
    status: orderStatusEnum("status").notNull().default("processing"),
    shippingType: orderShippingTypeEnum("shipping_type").notNull(),

    customerName: varchar("customer_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phoneNumber: varchar("phone_number", { length: 255 }).notNull(),

    state: varchar("state", { length: 255 }).notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    address: varchar("address", { length: 255 }).notNull(),

    estDeliveryDate: timestamp("estimated_delivery_date"),
    events: jsonb("events").notNull().$type<OrderEvent>(),

    userId: varchar("user_id", { length: 24 }).references(() => users.id, {
      onDelete: "set null",
    }),
    ...lifecycleDates,
  },
  (table) => ({
    trackingIdIdx: uniqueIndex("orders_tracking_id_idx").on(table.trackingId),
    userIdIdx: index("orders_user_id_idx").on(table.userId),
    emailIdx: index("orders_email_idx").on(table.email),
  }),
);

export const orderRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  payment: one(payments),
  orderItems: many(orderItems),
}));

export type Order = typeof orders.$inferSelect;

export const orderItems = pgTable("order_items", {
  id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
  size: integer("size").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  quantity: integer("quantity").notNull().default(1),
  productId: varchar("product_id", { length: 24 })
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  orderId: varchar("order_id", { length: 24 })
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
});

export const orderItemRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

export type OrderItem = typeof orderItems.$inferSelect;

export const paymentStatusEnum = pgEnum("payment_status", [
  "paid",
  "unpaid",
  "refunded",
]);

export const paymentMethodsEnum = pgEnum("payment_method", [
  "cash on delivery",
  "credit card",
  "easypaisa",
  "jazzcash",
]);

export const payments = pgTable("payments", {
  id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
  status: paymentStatusEnum("status").notNull().default("unpaid"),
  method: paymentMethodsEnum("method").notNull().default("cash on delivery"),
  discount: decimal("discount", { precision: 10, scale: 2 }),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingFee: decimal("shipping_fee", { precision: 10, scale: 2 }).notNull(),
  taxes: decimal("taxes", { precision: 10, scale: 2 }).notNull().default("0"),
  orderId: varchar("order_id", { length: 24 })
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  ...lifecycleDates,
});

export const paymentRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

export type Payment = typeof payments.$inferSelect;

export const discountCodeTypeEnum = pgEnum("discount_code_type", [
  "percentage",
  "fixed amount",
]);

export const discountCodes = pgTable(
  "discount_code",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    code: text("code").notNull(),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    amountType: discountCodeTypeEnum("amount_type").notNull(),
    minOrderAmount: decimal("min_order_amount", {
      precision: 10,
      scale: 2,
    }).notNull(),
    maxRedemptions: integer("max_redemptions"),
    timesRedeemed: integer("times_redeemed").notNull().default(0),
    isActive: boolean("is_active").notNull().default(true),
    expiresAt: timestamp("expires_at"),
    ...lifecycleDates,
  },
  (table) => ({
    couponCodeIdx: uniqueIndex("coupon_code_idx").on(table.code),
  }),
);

export type DiscountCode = typeof discountCodes.$inferSelect;
