import { z } from "zod";
import { isValidNumberForRegion } from "libphonenumber-js";
import { COUNTRY_CODE, STATES } from "@/lib/constants";
import {
  orderShippingTypeEnum,
  orderStatusEnum,
  paymentMethodsEnum,
  paymentStatusEnum,
} from "@/db/schema";
import { idSchema, idsSchema, searchParamsSchema } from "./common.validators";

export const orderSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .refine(
      (p) => isValidNumberForRegion(p, COUNTRY_CODE),
      "Please enter a valid phone number",
    ),
  state: z.enum(STATES, {
    required_error: "Please select your state",
  }),
  city: z.string().min(1, "Please enter your city name"),
  address: z.string().min(1, "Please enter your complete address"),
  customerName: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email").optional(),
  shippingType: z
    .enum(orderShippingTypeEnum.enumValues, {
      required_error: "Please select shipping type",
    })
    .default("standard"),
  paymentMethod: z.enum(paymentMethodsEnum.enumValues, {
    required_error: "Please select a payment method",
  }),
});

export type OrderSchema = z.infer<typeof orderSchema>;

export const trackOrderSchema = z.object({
  trackingId: z
    .string()
    .min(1, "Please enter your tracking id")
    .regex(/^(0|[1-9]\d*)$/, "Invalid tracking id"),
});

export type TrackOrderSchema = z.infer<typeof trackOrderSchema>;

export const cancelOrderSchema = idSchema.extend({
  reason: z.string().min(1, "Please provide a reason"),
});

export type CancelOrderSchema = z.infer<typeof cancelOrderSchema>;

export const getOrdersSchema = searchParamsSchema.extend({
  status: z.string().optional(),
  paymentStatus: z.string().optional(),
  shippingType: z.string().optional(),
});

export type GetOrdersSchema = z.infer<typeof getOrdersSchema>;

export const updateOrdersStatusSchema = idsSchema.extend({
  status: z.enum(orderStatusEnum.enumValues).optional(),
  paymentStatus: z.enum(paymentStatusEnum.enumValues).optional(),
});

export type UpdateOrdersStatusSchema = z.infer<typeof updateOrdersStatusSchema>;
