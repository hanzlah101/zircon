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

import type { ProductImage } from "./types";
import { CATEGORIES } from "@/lib/constants";
import { createId } from "@paralleldrive/cuid2";
import { relations } from "drizzle-orm";

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
  "user",
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

export const sessions = pgTable("session", {
  id: varchar("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  ipAddress: varchar("ip_address", { length: 255 }).notNull(),
  userAgent: varchar("user_agent", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 24 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  ...lifecycleDates,
});

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

export const verificationTokens = pgTable("verification_token", {
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

export const products = pgTable("product", {
  id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  notes: text("notes"),
  rating: decimal("rating", { precision: 2, scale: 1 }).notNull().default("0"),
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
  "product_size",
  {
    id: varchar("id", { length: 24 }).primaryKey().$defaultFn(createId),
    value: integer("value").notNull(),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    salePrice: decimal("sale_price", { precision: 10, scale: 2 }),
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
  "review",
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
