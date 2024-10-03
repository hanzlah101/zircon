import { z } from "zod";
import { isValidNumberForRegion } from "libphonenumber-js";
import { STATES } from "@/lib/constants";

export const checkoutSchema = z.object({
  phoneNumber: z
    .string()
    .min(1, "Please enter your phone number")
    .refine((phoneNumber) => {
      return isValidNumberForRegion(phoneNumber, "PK");
    }, "Please enter a valid phone number"),
  state: z.enum(STATES, { required_error: "Please select your state" }),
  city: z.string().min(1, "Please enter your city name"),
  address: z.string().min(1, "Please enter your complete address"),
  name: z.string().min(1, "Please enter your name"),
  email: z.string().email("Please enter a valid email").optional(),
});

export type CheckoutSchema = z.infer<typeof checkoutSchema>;
