import { useCallback, useEffect, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { getErrorMessage } from "@/lib/errors";
import { createId } from "@paralleldrive/cuid2";
import { toast } from "sonner";
import { uploadImage } from "@/actions/upload.actions";
import type { FileRejection } from "react-dropzone";
import { MAX_FILE_SIZE } from "@/lib/constants";
import ky from "ky";

export type Uploaded = {
  url: string;
  key: string;
  name: string;
};

export type PreviewFile = File & {
  preview: string;
  id: string;
  isUploading: boolean;
  order: number;
};

type OnUploadProps = {
  file: PreviewFile;
  folder: string;
};

type OnDropProps = {
  files: File[];
  value: Uploaded[];
  onValueChange: (uploaded: Uploaded[]) => void;
};

export async function upload(file: File, folder: string) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folder", folder);

  const [result, err] = await uploadImage(formData);

  if (err) throw err;

  const { presignedUrl, key, url } = result;

  await ky.put(presignedUrl, { body: file });

  return { url, key };
}

export function useUploadImages(folder: string, maxFiles: number) {
  const [previewFiles, setPreviewFiles] = useState<PreviewFile[]>([]);

  const { mutateAsync: handleUpload } = useMutation({
    mutationFn: async ({ file, folder }: OnUploadProps) => upload(file, folder),
    onError: (error, { file }) => {
      toast.error(getErrorMessage(error));
      setPreviewFiles((prev) => prev.filter((f) => f.id !== file.id));
    },
    onSettled: (_, __, { file }) => {
      setPreviewFiles((prev) =>
        prev.map((f) => (f.id === file.id ? { ...f, isUploading: false } : f)),
      );
    },
  });

  const onDrop = useCallback(
    async ({ files, value, onValueChange }: OnDropProps) => {
      if (value.length + files.length > maxFiles) {
        toast.error(`Can't have more than ${maxFiles} images`);
        return;
      }

      const newFiles = files.map((file, index) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
          id: createId(),
          isUploading: true,
          order: value.length + index,
        }),
      );

      setPreviewFiles((prev) => [...prev, ...newFiles]);

      const uploadPromises = newFiles.map(async (file) => {
        const uploaded = await handleUpload({ file, folder });
        return { ...uploaded, name: file.name, order: file.order };
      });

      const uploadedFiles = await Promise.all(uploadPromises);

      onValueChange([...value, ...uploadedFiles]);
      setPreviewFiles([]);
    },
    [handleUpload, folder, maxFiles],
  );

  const onDropRejected = useCallback(
    (rejected: FileRejection[]) => {
      rejected.map(({ file, errors }) => {
        if (errors[0].code === "too-many-files") {
          toast.error(`Can't have more than ${maxFiles} images`, {
            id: "too-many-files",
          });
        }

        const description =
          file.size > MAX_FILE_SIZE
            ? `Please upload a file less than ${MAX_FILE_SIZE / 1024 / 1024}MB`
            : !file.type.startsWith("image")
              ? "Please upload an image"
              : undefined;

        toast.error(`File ${file.name} rejected`, { description });
      });
    },
    [maxFiles],
  );

  useEffect(() => {
    return () => {
      if (previewFiles && previewFiles.length) {
        previewFiles.forEach((file) => URL.revokeObjectURL(file.preview));
      }
    };
  }, [previewFiles]);

  return { onDrop, onDropRejected, previewFiles };
}
