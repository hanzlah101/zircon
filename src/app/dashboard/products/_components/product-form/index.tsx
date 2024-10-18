"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { useParams, useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { IconPlus } from "@tabler/icons-react";
import {
  createProduct,
  updateProduct,
} from "@/actions/product/product.actions";

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
import {
  productSchema,
  ProductSchema,
  UpdateProductSchema,
} from "@/validators/product.validators";

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
    <div className="flex h-56 w-full items-center justify-center rounded-md border">
      <Spinner />
    </div>
  ),
});

type ProductFormProps = {
  initialValues?: UpdateProductSchema;
};

export function ProductForm({ initialValues }: ProductFormProps) {
  const { productId }: { productId: string } = useParams();
  const [openSizeOptions, setOpenSizeOptions] = useState<string[]>(["0"]);

  const router = useRouter();

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
          price: "",
          compareAtPrice: null,
          stock: NaN,
          value: NaN,
        },
      ],
    };
  }, [initialValues]);

  const form = useForm<ProductSchema>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });

  const { dirtyFields } = useFormState({
    control: form.control,
  });

  const {
    fields: sizes,
    append: appendSize,
    remove: removeSize,
  } = useFieldArray({
    control: form.control,
    name: "sizes",
  });

  const { mutate, isPending, status } = useMutation({
    mutationFn: async (values: Partial<ProductSchema>) => {
      if (productId && initialValues) {
        if (Object.keys(values).length === 0) {
          router.push("/dashboard/products");
          return;
        }

        const result = await updateProduct({ ...values, id: productId });
        if (!result) return;

        const [_, err] = result;
        if (err) throw err;
      } else {
        const result = await createProduct(values as ProductSchema);
        if (!result) return;

        const [_, err] = result;
        if (err) throw err;
      }
    },
    onError: onFormError(form),
  });

  const onSubmit = form.handleSubmit((values) => {
    const dirtyValues = Object.keys(values).reduce<Partial<ProductSchema>>(
      (acc, key) => {
        const typedKey = key as keyof ProductSchema;
        if (dirtyFields[typedKey] === true) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (acc as any)[typedKey] = values[typedKey];
        }
        return acc;
      },
      {},
    );

    if (!!dirtyFields.sizes) {
      dirtyValues.sizes = values.sizes;
    }

    mutate(dirtyValues);
  });

  return (
    <div className="space-y-4">
      <Form {...form}>
        <h1 className="font-heading text-3xl font-semibold">
          {initialValues ? `${initialValues.title}` : "Create Product"}
        </h1>

        {/* TODO:handle after nav */}
        <FormError className="scroll-m-16" />

        <form onSubmit={onSubmit} className="space-y-4">
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
                          <Input
                            autoFocus
                            placeholder="Enter title"
                            {...field}
                          />
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
                    disabled={isPending}
                    onClick={() => {
                      setOpenSizeOptions([
                        ...openSizeOptions,
                        sizes.length.toString(),
                      ]);
                      appendSize({
                        value: NaN,
                        stock: NaN,
                        price: "",
                        compareAtPrice: null,
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
                            <ComboboxTrigger
                              disabled={isPending}
                              placeholder="Select category"
                            >
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
                          disabled={isPending}
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
                          disabled={isPending}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger
                              disabled={isPending}
                              className="capitalize"
                            >
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
                          disabled={isPending}
                          defaultValue={field.value}
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger
                              disabled={isPending}
                              className="capitalize"
                            >
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

              <StatusButton
                type="submit"
                status={status}
                size={"lg"}
                radius={"full"}
                successMessage={!!initialValues ? "Saved" : "Created"}
                className="h-12 w-full text-[17px] transition-all duration-300 hover:ring-[3px] hover:ring-ring hover:ring-offset-[3px] hover:ring-offset-background md:h-14"
              >
                {!!initialValues ? "Save" : "Create"}
              </StatusButton>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
