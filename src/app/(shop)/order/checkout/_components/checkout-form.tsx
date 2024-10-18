"use client";

import { useEffect, useMemo } from "react";
import { useForm, useFormState } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SHIPPING_PRICES, ShippingType, STATES } from "@/lib/constants";
import { orderSchema, OrderSchema } from "@/validators/order.validators";
import type { User } from "lucia";
import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";

import { Button } from "@/components/ui/button";
import { useAuthModal } from "@/stores/use-auth-modal";
import { PhoneInput } from "@/components/ui/phone-input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupCardItem } from "@/components/ui/radio-group";
import { capitalize, formatPrice } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { orderShippingTypeEnum } from "@/db/schema";
import { CODIcon } from "@/components/icons/cod";
import { AnimatePresence, motion } from "framer-motion";
import { StatusButton } from "@/components/ui/status-button";
import type { getLastOrder } from "@/queries/order.queries";
import { useServerAction } from "@/hooks/use-server-action";
import { createOrder } from "@/actions/order/order.actions";
import { toast } from "sonner";
import { onFormError } from "@/lib/errors";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/stores/use-cart-store";

type CheckoutFormProps = {
  user: User | null;
  lastOrder: Awaited<ReturnType<typeof getLastOrder>>;
};

export function CheckoutForm({ user, lastOrder }: CheckoutFormProps) {
  const { onOpen: onLogin } = useAuthModal();
  const { cart } = useCartStore();

  const searchParams = useSearchParams();
  const mode = searchParams.get("mode");

  const { removeAllProducts } = useCartStore();

  const form = useForm<OrderSchema>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      phoneNumber: lastOrder?.phoneNumber || "",
      state: (lastOrder?.state as (typeof STATES)[number]) || undefined,
      city: lastOrder?.city || "",
      address: lastOrder?.address || "",
      customerName: lastOrder?.customerName || user?.name || "",
      email: lastOrder?.email || user?.email || "",
      shippingType: "standard",
      // TODO: change to lastOrder?.paymentMethod || "cash on delivery" once other methods implemented
      paymentMethod: "cash on delivery",
    },
  });

  const { isValid, errors } = useFormState({
    control: form.control,
  });

  const formShippingType = form.watch("shippingType");

  const [shippingType, setShippingType] = useQueryState(
    "shipping_type",
    parseAsStringEnum(orderShippingTypeEnum.enumValues).withDefault("standard"),
  );

  const {
    mutate: placeOrder,
    isPending,
    status,
  } = useServerAction(createOrder, {
    onSuccess: ({ orderId }) => {
      toast.success("Order placed successfully", { position: "top-center" });
      window.location.href = `/order/${orderId}?success=true`;
      if (mode !== "buy-now") {
        removeAllProducts();
      }
    },

    onError: onFormError(form),
  });

  const checkoutItems = useMemo(() => {
    if (mode === "buy-now") {
      const qty = parseInt(searchParams.get("qty") || "1", 10);
      const productId = searchParams.get("productId") as string;
      const sizeId = searchParams.get("sizeId") as string;
      return [{ qty, productId, sizeId }];
    } else {
      return cart;
    }
  }, [searchParams, cart, mode]);

  const onSubmit = form.handleSubmit((values) =>
    placeOrder({ ...values, items: checkoutItems }),
  );

  const shouldShowSubmit = useMemo(() => {
    if (isValid) return true;
    if (!!errors.root && Object.keys(errors).length === 1) return true;
    if (status === "error" || status === "pending") return true;
    return false;
  }, [isValid, errors, status]);

  useEffect(() => {
    if (formShippingType && formShippingType !== shippingType) {
      setShippingType(formShippingType);
    }
  }, [formShippingType, shippingType, setShippingType]);

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="w-full space-y-4 lg:col-span-2">
        <div className="space-y-4">
          {!user ? (
            <Card className="flex items-center justify-between gap-x-4 p-6">
              <CardHeader className="p-0">
                <CardTitle>Login for a better experience</CardTitle>
                <CardDescription>
                  Sign in for personalized shopping and faster checkout!
                </CardDescription>
              </CardHeader>
              <Button
                variant={"outline"}
                onClick={() => onLogin("login")}
                disabled={isPending}
              >
                Login
              </Button>
            </Card>
          ) : null}

          <FormError className="scroll-m-20" />

          <Card>
            <CardHeader>
              <CardTitle>Personal information</CardTitle>
              <CardDescription>
                We&apos;ll use this information to contact you about your order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="customerName"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          autoFocus
                          placeholder="Enter your name"
                          autoComplete="name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          autoComplete="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="phoneNumber"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <PhoneInput
                        disabled={isPending}
                        placeholder="Phone Number"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping address</CardTitle>
              <CardDescription>
                We&apos;ll use this information to ship your order.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="state"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <Combobox
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <ComboboxTrigger
                            disabled={isPending}
                            placeholder="Select your state"
                          >
                            {field.value}
                          </ComboboxTrigger>
                        </FormControl>

                        <ComboboxContent>
                          <ComboboxInput
                            placeholder="Search..."
                            className="h-9"
                          />

                          <ComboboxList>
                            <ComboboxEmpty>No results found.</ComboboxEmpty>
                            <ComboboxGroup>
                              {STATES.map((state) => (
                                <ComboboxItem key={state} value={state}>
                                  {state}
                                </ComboboxItem>
                              ))}
                            </ComboboxGroup>
                          </ComboboxList>
                        </ComboboxContent>
                      </Combobox>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="city"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Street Address</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your address"
                        autoComplete="address-line1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shippingType"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shipping Type</FormLabel>
                    <FormControl>
                      <RadioGroup
                        disabled={isPending}
                        defaultValue={field.value}
                        onValueChange={(value: ShippingType) => {
                          field.onChange(value);
                          setShippingType(value);
                        }}
                      >
                        <FormItem className="space-y-2.5">
                          {SHIPPING_PRICES.map((item) => (
                            <FormControl key={item.type}>
                              <RadioGroupCardItem
                                value={item.type}
                                icon={item.icon}
                              >
                                <div className="flex flex-1 items-center justify-between gap-2">
                                  <div className="space-y-1 text-start">
                                    <h2 className="font-semibold">
                                      {capitalize(item.type)} Delivery
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                      Your parcel will be delivered within{" "}
                                      <span className="font-medium text-foreground">
                                        {item.time}
                                      </span>
                                    </p>
                                  </div>

                                  <p className="text-sm font-medium transition-opacity">
                                    {formatPrice(item.amount)}
                                  </p>
                                </div>
                              </RadioGroupCardItem>
                            </FormControl>
                          ))}
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                disabled={isPending}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <FormControl>
                      <RadioGroup
                        disabled={isPending}
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormItem className="space-y-2.5">
                          <FormControl>
                            <RadioGroupCardItem
                              value={"cash on delivery"}
                              icon={CODIcon}
                            >
                              <div className="flex flex-1 items-center justify-between">
                                <div className="space-y-1 text-start">
                                  <h2 className="font-semibold">
                                    Cash on delivery
                                  </h2>
                                  <p className="text-sm text-muted-foreground">
                                    Secure payment upon delivery—shop with
                                    confidence!
                                  </p>
                                </div>
                              </div>
                            </RadioGroupCardItem>
                          </FormControl>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <AnimatePresence>
            {shouldShowSubmit ? (
              <motion.div
                className="fixed inset-x-0 bottom-0 z-40 border-t bg-background px-6 py-3 lg:hidden"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                transition={{ duration: 0.2 }}
              >
                <StatusButton
                  type="submit"
                  status={status}
                  successMessage={"Order placed"}
                  radius={"full"}
                  size={"lg"}
                >
                  Place Order!
                </StatusButton>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <StatusButton
            type="submit"
            radius={"full"}
            size={"lg"}
            status={status}
            successMessage={"Order placed!"}
            className="mt-4 hidden h-12 w-full text-[17px] transition-all duration-300 hover:ring-[3px] hover:ring-ring hover:ring-offset-[3px] hover:ring-offset-background disabled:bg-muted-foreground disabled:text-muted md:h-14 lg:block"
          >
            Place Order!
          </StatusButton>
        </div>
      </form>
    </Form>
  );
}
