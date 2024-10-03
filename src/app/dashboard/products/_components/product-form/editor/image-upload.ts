import { upload } from "@/hooks/use-upload-files";
import { createImageUpload } from "novel/plugins";
import { toast } from "sonner";

const onUpload = (file: File) => {
  return new Promise((resolve) => {
    toast.promise(
      upload(file, "product-details").then(async ({ url }) => {
        const image = new Image();
        image.src = url;
        image.onload = () => resolve(url);
      }),
      {
        loading: "Uploading image...",
        success: "Image uploaded successfully.",
        error: (e) => e.message,
      },
    );
  });
};

export const uploadFn = createImageUpload({
  onUpload,
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 5) {
      toast.error("File size too big (max 5MB).");
      return false;
    }
    return true;
  },
});
