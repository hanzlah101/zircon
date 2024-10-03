"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

import { createProduct } from "@/actions/product/product.actions";
import { productLabelEnum, productStatusEnum } from "@/db/schema";
import { onFormError } from "@/lib/errors";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormError,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";
import { useServerAction } from "@/hooks/use-server-action";
import { productSchema, ProductSchema } from "@/validators/product.validators";
import { IconPlus } from "@tabler/icons-react";
import {
  useFieldArray,
  useForm,
  useFormState,
  type DefaultValues,
} from "react-hook-form";

import { StatusButton } from "@/components/ui/status-button";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";

import { ProductSizeForm } from "./product-size-form";
import { ProductImageSelect } from "./product-image-select";
import { CATEGORIES } from "@/lib/constants";
import { TagInput } from "@/components/ui/tag-input";
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

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Editor = dynamic(() => import("./editor"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 w-full items-center justify-center rounded-md border bg-accent/50">
      <Spinner />
    </div>
  ),
});

type ProductFormProps = {
  initialValues?: ProductSchema;
};

export function ProductForm({ initialValues }: ProductFormProps) {
  const [openSizeOptions, setOpenSizeOptions] = useState<string[]>(["0"]);

  const defaultValues: DefaultValues<ProductSchema> = useMemo(() => {
    if (initialValues) {
      return initialValues;
    }

    return {
      title: "",
      description: "",
      notes: "",
      tags: [],
      status: "draft",
      label: "none",
      images: [],
      category: undefined,
      sizes: [
        {
          price: undefined,
          salePrice: undefined,
          stock: undefined,
          value: undefined,
        },
      ],
    };
  }, [initialValues]);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const { isDirty } = useFormState({ control: form.control });

  const {
    fields: sizes,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const {
    mutate: create,
    isPending,
    status,
  } = useServerAction(createProduct, {
    onError: onFormError(form),
  });

  const onSubmit = form.handleSubmit((values) => create(values));

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-4">
        <h1 className="text-2xl font-semibold">Create Product</h1>

        <FormError />

        <div className="grid gap-4 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
          <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Product Details</CardTitle>
                <CardDescription>
                  Basic information about your product
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input autoFocus placeholder="Enter title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Editor
                          disabled={isPending}
                          initialValue={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Editor
                          disabled={isPending}
                          initialValue={field.value}
                          onChange={field.onChange}
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
                <CardTitle>Pricing & Sizes</CardTitle>
                <CardDescription>
                  Set your product sizes & pricing
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <Accordion
                  type="multiple"
                  className="w-full"
                  disabled={isPending}
                  value={openSizeOptions}
                  onValueChange={setOpenSizeOptions}
                >
                  {sizes.map((_, index) => (
                    <ProductSizeForm
                      key={index}
                      index={index}
                      disabled={isPending}
                      total={sizes.length}
                      onRemove={() => removeSize(index)}
                    />
                  ))}
                </Accordion>
              </CardContent>

              <CardFooter className="justify-center">
                <Button
                  size={"sm"}
                  variant={"outline"}
                  className="bg-accent/50"
                  onClick={() => {
                    setOpenSizeOptions([
                      ...openSizeOptions,
                      sizes.length.toString(),
                    ]);
                    appendSize({
                      value: NaN,
                      stock: NaN,
                      price: "",
                      salePrice: null,
                    });
                  }}
                >
                  <IconPlus className="mr-2 size-4" />
                  Add size
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
                <CardDescription>
                  Image gallery for your product
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ProductImageSelect disabled={isPending} />
              </CardContent>
            </Card>
          </div>
          <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Category & Tags</CardTitle>
                <CardDescription>
                  Categories & Tags for your product
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="category"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Combobox
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <ComboboxTrigger placeholder="Select category">
                            {field.value}
                          </ComboboxTrigger>
                        </FormControl>

                        <ComboboxContent>
                          <ComboboxInput
                            placeholder="Search categories..."
                            className="h-9"
                          />

                          <ComboboxList>
                            <ComboboxEmpty>No results found.</ComboboxEmpty>
                            <ComboboxGroup>
                              {CATEGORIES.map((category) => (
                                <ComboboxItem key={category} value={category}>
                                  {category}
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
                  name="tags"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags</FormLabel>

                      <TagInput
                        value={field.value}
                        onValueChange={field.onChange}
                      />

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Product Status</CardTitle>
                <CardDescription>
                  Select the status & label of your product
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="capitalize">
                            <SelectValue placeholder="Select label" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {productLabelEnum.enumValues.map((label) => (
                            <SelectItem
                              key={label}
                              value={label}
                              className="capitalize"
                            >
                              {label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  disabled={isPending}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger className="capitalize">
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {productStatusEnum.enumValues.map((status) => (
                            <SelectItem
                              key={status}
                              value={status}
                              className="capitalize"
                            >
                              {status}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {isDirty ? (
          <motion.div
            className="sticky inset-x-0 bottom-6 mx-4 flex flex-1 items-center justify-between gap-4 rounded-lg border bg-background px-6 py-3 shadow-md md:mx-14"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.2 }}
          >
            <div>
              <h1 className="font-semibold">You&apos;ve unsaved changes</h1>
              <p className="hidden text-sm text-muted-foreground md:block">
                Your changes will be lost if you don&apos;t save them.
              </p>
            </div>

            <StatusButton
              type="submit"
              status={status}
              successMessage={"Saved"}
              className={"w-[90px]"}
            >
              Save
            </StatusButton>
          </motion.div>
        ) : null}
      </form>
    </Form>
  );
}
