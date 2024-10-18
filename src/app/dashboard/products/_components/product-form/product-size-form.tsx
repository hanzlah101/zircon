import { NumberInput } from "@/components/ui/number-input";
import { useFormContext, useWatch } from "react-hook-form";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ProductSchema } from "@/validators/product.validators";
import { Button } from "@/components/ui/button";
import { IconTrash } from "@tabler/icons-react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

type ProductSizeFormrops = {
  index: number;
  disabled: boolean;
  total: number;
  onRemove: () => void;
};

export function ProductSizeForm({
  index,
  total,
  disabled,
  onRemove,
}: ProductSizeFormrops) {
  const form = useFormContext<ProductSchema>();

  const value = useWatch({
    control: form.control,
    name: `sizes.${index}.value`,
  });

  return (
    <AccordionItem value={index.toString()}>
      <AccordionTrigger className="font-semibold">
        Size {value ? `${Number(value)} ml` : ` #${index + 1}`}
      </AccordionTrigger>

      <AccordionContent>
        {total > 1 ? (
          <div className="mb-1 flex w-full justify-end">
            <Tooltip delayDuration={150}>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={onRemove}
                  disabled={disabled}
                  className="size-7 rounded-sm"
                >
                  <IconTrash className="size-4" />
                  <span className="sr-only">
                    Remove Size {value ? `${value}ml` : ` #${index + 1}`}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent side={"top"}>
                Remove Size {value ? `${value}ml` : ` #${index + 1}`}
              </TooltipContent>
            </Tooltip>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-x-2 gap-y-4 p-1 sm:grid-cols-2 2xl:grid-cols-4">
          <FormField
            control={form.control}
            name={`sizes.${index}.value`}
            disabled={disabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Size</FormLabel>
                <FormControl>
                  <NumberInput
                    inputMode="numeric"
                    placeholder="Enter size in ml"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sizes.${index}.stock`}
            disabled={disabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Stock</FormLabel>
                <FormControl>
                  <NumberInput
                    inputMode="numeric"
                    placeholder="Enter you stock"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sizes.${index}.price`}
            disabled={disabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <NumberInput
                    inputMode="decimal"
                    placeholder="Enter price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`sizes.${index}.compareAtPrice`}
            disabled={disabled}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare at price</FormLabel>
                <FormControl>
                  <NumberInput
                    inputMode="decimal"
                    placeholder="Enter compare at price"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}
