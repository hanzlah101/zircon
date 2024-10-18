"use client";

import Link from "next/link";
import Image from "next/image";
import parse from "html-react-parser";
import useCarousel from "embla-carousel-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useQueryState, parseAsInteger } from "nuqs";
import { useCartStore } from "@/stores/use-cart-store";

import type { ProductImage } from "@/db/types";
import type { getProductById } from "@/queries/product.queries";

import {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

import { Label } from "@/components/ui/label";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { IconMinus, IconPlus, IconShoppingBag } from "@tabler/icons-react";
import { useBagModal } from "@/stores/use-bag-modal";
import { RatingStarsPreview } from "../../_components/rating-stars-preview";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

type ProductDetailsProps = {
  product: NonNullable<Awaited<ReturnType<typeof getProductById>>>;
};

export function ProductDetails({ product }: ProductDetailsProps) {
  const { onOpen } = useBagModal();

  const sizes = useMemo(
    () => product.sizes.sort((a, b) => a.value - b.value),
    [product.sizes],
  );

  const firstSize = useMemo(
    () => sizes.filter((size) => size.stock > 0)[0],
    [sizes],
  );

  const [selected, setSelected] = useQueryState("size", {
    defaultValue: firstSize?.id,
    scroll: false,
  });

  const selectedSize = useMemo(
    () => sizes.find((size) => size.id === selected),
    [sizes, selected],
  );

  const isOutOfStock = !selectedSize || selectedSize?.stock <= 0;

  const { addToCart } = useCartStore();
  const [qty] = useQueryState("qty", parseAsInteger.withDefault(1));

  const { price, compareAtPrice } = useMemo(() => {
    const price = selectedSize?.price || firstSize?.price || sizes[0].price;

    const compareAtPrice =
      selectedSize?.compareAtPrice ||
      firstSize?.compareAtPrice ||
      sizes[0].compareAtPrice;

    return { price, compareAtPrice };
  }, [selectedSize, firstSize, sizes]);

  const handleAddToBag = () => {
    if (isOutOfStock) return;

    addToCart({
      qty: qty || 1,
      productId: product.id,
      sizeId: selectedSize?.id,
      stock: selectedSize?.stock,
    });

    onOpen();
  };

  return (
    <div className="grid w-full grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
      <ProductCarousel images={product.images} />
      <div>
        <h1 className="mb-1 font-heading text-3xl font-semibold tracking-tighter md:text-4xl">
          {product.title}
        </h1>

        <span className="text-sm font-medium text-muted-foreground">
          {product.category}
        </span>

        <div className="mt-1 flex items-end gap-x-2">
          <h1 className="font-heading text-3xl tracking-tighter md:text-4xl">
            {formatPrice(price)}
          </h1>

          {compareAtPrice ? (
            <h1 className="font-heading text-xl tracking-tighter text-muted-foreground line-through md:text-2xl">
              {formatPrice(compareAtPrice)}
            </h1>
          ) : null}
        </div>

        <div className="mt-3 flex items-center gap-x-4">
          <div className="rounded-sm bg-yellow-600 px-2 py-0.5 text-sm text-white">
            {product.rating}
          </div>
          <RatingStarsPreview rating={Number(product.rating)} />
        </div>

        {isOutOfStock ? (
          <p className="mt-3 text-sm text-destructive">Out of stock</p>
        ) : selectedSize?.stock <= 10 ? (
          <p className="mt-3 text-sm text-destructive">
            Only {selectedSize?.stock} left in stock
          </p>
        ) : (
          <p className="mt-3 text-sm text-emerald-600">In stock</p>
        )}

        {sizes.length > 1 ? (
          <div>
            <p className="mt-5 text-sm">
              Size{selectedSize ? `: ${selectedSize?.value} ml` : null}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {sizes.map((size) => (
                <button
                  key={size.id}
                  onClick={() => setSelected(size.id)}
                  className={cn(
                    "relative flex items-center justify-center border border-primary p-2 text-sm focus-visible:outline-none disabled:pointer-events-none disabled:opacity-70",
                    selectedSize?.id === size.id
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-transparent hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  {size.value} ml
                  {size.stock <= 0 ? (
                    <div className="absolute left-1/2 top-1/2 z-10 h-full w-px -translate-x-1/2 -translate-y-1/2 rotate-45 bg-current" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm font-medium text-muted-foreground">
            Size:{" "}
            <span className="text-foreground">
              {selectedSize?.value || sizes[0].value} ml
            </span>
          </p>
        )}

        <QtyInput stock={selectedSize?.stock} />

        <Button
          size="lg"
          radius="full"
          disabled={isOutOfStock}
          className="mt-4 h-12 w-full text-[17px] transition-all duration-300 hover:ring-[3px] hover:ring-ring hover:ring-offset-[3px] hover:ring-offset-background disabled:bg-muted-foreground disabled:text-muted md:h-14"
          onClick={handleAddToBag}
        >
          {!isOutOfStock ? (
            <IconShoppingBag className="mr-2 size-[22px]" />
          ) : null}
          {isOutOfStock ? "Out of stock" : "Add to bag"}
        </Button>

        {!isOutOfStock ? (
          <Button
            size="lg"
            radius="full"
            variant={"outline"}
            disabled={isOutOfStock}
            asChild
            className="mt-4 h-12 w-full text-[17px] md:h-14"
          >
            <Link
              href={{
                pathname: "/order/checkout",
                query: {
                  mode: "buy-now",
                  productId: product.id,
                  sizeId: selectedSize.id,
                  qty,
                },
              }}
            >
              Buy Now!
            </Link>
          </Button>
        ) : null}

        {product.description || product.notes ? (
          <Accordion
            type="multiple"
            className="mt-5"
            defaultValue={["description"]}
          >
            <Prose content={product.description} label="Description" />
            <Prose content={product.notes} label="Notes" />
          </Accordion>
        ) : null}
      </div>
    </div>
  );
}

type ProductCarouselProps = {
  images: ProductImage[];
};

function ProductCarousel({ images }: ProductCarouselProps) {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const [carouselThumbsRef, carouselThumbsApi] = useCarousel({
    containScroll: "keepSnaps",
    dragFree: true,
  });

  const onThumbClick = useCallback(
    (index: number) => {
      if (!carouselApi || !carouselThumbsApi) return;
      carouselApi.scrollTo(index);
    },
    [carouselApi, carouselThumbsApi],
  );

  const onSelect = useCallback(() => {
    if (!carouselApi || !carouselThumbsApi) return;
    setSelectedIndex(carouselApi.selectedScrollSnap());
    carouselThumbsApi.scrollTo(carouselApi.selectedScrollSnap());
  }, [carouselApi, carouselThumbsApi]);

  useEffect(() => {
    if (!carouselApi) return;
    carouselApi.on("select", onSelect);
    onSelect();

    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi, onSelect]);

  const sortedImages = useMemo(() => {
    return images.sort((a, b) => a.order - b.order);
  }, [images]);

  return (
    <div className="flex flex-col gap-y-4">
      <Carousel setApi={setCarouselApi} className="w-full shrink-0">
        <CarouselContent>
          {sortedImages.map((img, index) => (
            <CarouselItem key={img.key + index}>
              <div className="relative aspect-square w-full cursor-pointer overflow-hidden rounded-xl bg-muted/50">
                <Image
                  fill
                  src={img.url}
                  alt={img.name}
                  className="rounded-xl object-cover"
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
      {sortedImages.length > 1 ? (
        <div className="w-full overflow-hidden" ref={carouselThumbsRef}>
          <ul className="flex items-center gap-3 p-2">
            {sortedImages.map((img, index) => (
              <li
                key={img.key + index}
                onClick={() => onThumbClick(index)}
                className={cn(
                  "relative size-28 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-muted ring-[3px] ring-offset-2 ring-offset-background transition md:size-32",
                  selectedIndex === index
                    ? "ring-muted-foreground/50"
                    : "ring-transparent",
                )}
              >
                <Image fill src={img.url} alt={img.name} objectFit="cover" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

type ProseProps = {
  label: string;
  content: string | null;
};

function Prose({ content, label }: ProseProps) {
  if (!content) return null;

  return (
    <AccordionItem value={label.toLowerCase()}>
      <AccordionTrigger>{label}</AccordionTrigger>
      <AccordionContent>
        <article
          data-state="preview"
          className="prose prose-neutral max-w-none dark:prose-invert prose-headings:text-foreground prose-p:text-muted-foreground"
        >
          {parse(content)}
        </article>
      </AccordionContent>
    </AccordionItem>
  );
}

type QtyInputProps = {
  stock?: number;
};

function QtyInput({ stock }: QtyInputProps) {
  const [qty, setQty] = useQueryState("qty", parseAsInteger.withDefault(1));
  const [inputValue, setInputValue] = useState(qty || 1);

  const handleBlur = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!stock) return;
      const newVal = e.target.valueAsNumber;

      if (newVal === 0) {
        setQty(1);
        setInputValue(1);
        return;
      }

      if (isNaN(newVal)) {
        setQty(qty);
        setInputValue(qty);
        return;
      }

      if (newVal > stock) {
        setQty(stock);
        setInputValue(stock);
        return;
      }

      setQty(newVal);
    },
    [stock, setQty, qty],
  );

  useEffect(() => setInputValue(qty || 1), [qty]);

  useEffect(() => {
    if (stock && qty > stock) {
      setQty(stock);
    }
  }, [stock, qty, setQty]);

  return (
    <div className="mt-3">
      <Label htmlFor="qty-input">Quantity</Label>
      <div className="mt-2 flex items-center">
        <Button
          size={"icon"}
          variant={"secondary"}
          onClick={() => setQty(qty - 1)}
          disabled={!stock || qty <= 1}
          radius={"none"}
        >
          <IconMinus className="size-4" />
          <span className="sr-only">Decrease quantity</span>
        </Button>

        <input
          type="number"
          min="1"
          id={"qty-input"}
          max={stock}
          value={inputValue}
          disabled={!stock}
          inputMode="numeric"
          onChange={(e) => setInputValue(e.target.valueAsNumber)}
          onBlur={handleBlur}
          className="z-10 size-10 border-y border-secondary px-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        />

        <Button
          size={"icon"}
          variant={"secondary"}
          onClick={() => setQty(qty + 1)}
          disabled={!stock || qty >= stock}
          radius={"none"}
        >
          <span className="sr-only">Increase quantity</span>
          <IconPlus className="size-4" />
        </Button>
      </div>
    </div>
  );
}
