"use client";

import { ProductSchema } from "@/validators/product.validators";
import { useFormContext } from "react-hook-form";
import Dropzone from "react-dropzone";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import Image from "next/image";
import { useUploadImages } from "@/hooks/use-upload-files";
import { Spinner } from "@/components/ui/spinner";
import { IconUpload, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { MAX_FILE_SIZE, MAX_PRODUCT_IMAGES } from "@/lib/constants";
import { Sortable, SortableItem } from "@/components/ui/sortable";
import { closestCorners } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";

type ProductSizeFormProps = {
  disabled: boolean;
};

export function ProductImageSelect({ disabled }: ProductSizeFormProps) {
  const form = useFormContext<ProductSchema>();

  const { previewFiles, onDrop, onDropRejected } = useUploadImages(
    "product-images",
    MAX_PRODUCT_IMAGES,
  );

  return (
    <FormField
      control={form.control}
      name="images"
      disabled={disabled}
      render={({ field, fieldState: { error } }) => {
        const isInvalid =
          !!error &&
          (error.type === "too_small"
            ? previewFiles.length + field.value.length >= 2
              ? false
              : true
            : true);

        const errorMessage = isInvalid ? error.message : null;

        return (
          <>
            <FormItem>
              <FormLabel
                className={cn(
                  isInvalid ? "text-destructive" : "text-foreground",
                )}
              >
                Images
              </FormLabel>

              {!!previewFiles.length || !!field.value.length ? (
                <Sortable
                  orientation="mixed"
                  collisionDetection={closestCorners}
                  value={field.value.map((image) => ({
                    id: image.key,
                    ...image,
                  }))}
                  onValueChange={(sorted) => {
                    const newImages = sorted.map((image, index) => {
                      return {
                        key: image.id,
                        url: image.url,
                        name: image.name,
                        order: index + 1,
                      };
                    });

                    field.onChange(newImages);
                  }}
                  overlay={
                    <div className="size-full rounded-lg bg-black/10 dark:bg-black/40" />
                  }
                >
                  <div className="!mb-6 grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-5">
                    {field.value && !!field.value.length
                      ? field.value
                          .sort((a, b) => a.order - b.order)
                          .map((image, index) => (
                            <SortableItem
                              asTrigger
                              key={image.key}
                              value={image.key}
                              aria-disabled={disabled}
                              className="group relative aspect-square overflow-hidden rounded-lg bg-accent aria-disabled:pointer-events-none"
                            >
                              <Image
                                fill
                                src={image.url}
                                alt={image.name}
                                objectFit="cover"
                                className="rounded-lg bg-accent"
                              />

                              <Button
                                size="icon"
                                disabled={disabled}
                                variant={"destructive"}
                                onMouseDown={(e) => e.stopPropagation()}
                                onMouseUp={(e) => e.stopPropagation()}
                                aria-label="Remove image"
                                className="absolute right-2 top-2 z-50 size-6 cursor-pointer rounded-sm opacity-0 transition-opacity disabled:opacity-0 group-hover:opacity-100"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  form.trigger("images");

                                  const filteredImages = field.value.filter(
                                    (_, i) => i !== index,
                                  );

                                  const updatedImages = filteredImages.map(
                                    (image, idx) => ({
                                      ...image,
                                      order: idx,
                                    }),
                                  );

                                  field.onChange(updatedImages);
                                }}
                              >
                                <IconX className="size-4" />
                              </Button>
                            </SortableItem>
                          ))
                      : null}

                    {previewFiles
                      .sort((a, b) => a.order - b.order)
                      .map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square w-full overflow-hidden rounded-lg"
                        >
                          <Image
                            fill
                            src={file.preview}
                            alt={file.name}
                            objectFit="cover"
                            className="bg-accent"
                          />

                          {file.isUploading ? (
                            <div className="absolute inset-0 flex h-full w-full flex-col items-center justify-center gap-1.5 bg-black/60 text-white">
                              <Spinner />
                              <p className="text-sm">Uploading...</p>
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </Sortable>
              ) : null}

              {previewFiles.length + field.value.length < MAX_PRODUCT_IMAGES ? (
                <Dropzone
                  multiple
                  maxFiles={MAX_PRODUCT_IMAGES}
                  maxSize={MAX_FILE_SIZE}
                  disabled={disabled}
                  accept={{ "image/*": [] }}
                  onDropRejected={onDropRejected}
                  onDrop={(files) => {
                    form.trigger("images");
                    onDrop({
                      files,
                      value: field.value,
                      onValueChange: (v) => {
                        field.onChange(v);
                        form.trigger("images");
                      },
                    });
                  }}
                >
                  {({ getRootProps, getInputProps, isDragActive }) => (
                    <div
                      {...getRootProps()}
                      className={cn(
                        "group relative grid h-52 w-full cursor-pointer place-items-center rounded-lg border-2 border-dashed border-muted-foreground/25 px-5 py-2.5 text-center transition hover:bg-muted/25",
                        "ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                        isDragActive && "border-muted-foreground/50",
                        disabled && "pointer-events-none opacity-60",
                      )}
                    >
                      <FormControl>
                        <input {...getInputProps()} />
                      </FormControl>
                      {isDragActive ? (
                        <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                          <div className="rounded-full border border-dashed p-3">
                            <IconUpload
                              className="size-7 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          <p className="font-medium text-muted-foreground">
                            Drop the files here
                          </p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center gap-4 sm:px-5">
                          <div className="rounded-full border border-dashed p-3">
                            <IconUpload
                              className="size-7 text-muted-foreground"
                              aria-hidden="true"
                            />
                          </div>
                          <div className="flex flex-col gap-px">
                            <p className="font-medium text-muted-foreground">
                              Drag {`'n'`} drop files here, or click to select
                              files
                            </p>
                            <p className="text-sm text-muted-foreground/70">
                              You can upload {MAX_PRODUCT_IMAGES} files (up to{" "}
                              {MAX_FILE_SIZE / 1024 / 1024}MB each)
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </Dropzone>
              ) : null}

              {errorMessage ? <FormMessage>{errorMessage}</FormMessage> : null}
            </FormItem>
          </>
        );
      }}
    />
  );
}
