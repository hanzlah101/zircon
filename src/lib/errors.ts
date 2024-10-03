import { ZSAError } from "zsa";
import type { FieldValues, UseFormReturn } from "react-hook-form";

export function onUniqueConstraintError(message: string) {
  return (error: unknown) => {
    if (
      error instanceof ZSAError &&
      error.data instanceof Object &&
      "code" in error.data &&
      error.data?.code === "23505"
    ) {
      throw new ZSAError("FORBIDDEN", message);
    } else {
      throw error;
    }
  };
}

export function getErrorMessage(error: unknown) {
  if (error instanceof ZSAError) {
    return error.message;
  } else if (error instanceof Error) {
    return error.message;
  } else if (
    error instanceof Object &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  } else {
    return "Something went wrong, please try again later";
  }
}

export function onFormError<T extends FieldValues>(form: UseFormReturn<T>) {
  return (error: unknown) => {
    const message = getErrorMessage(error);
    form.setError("root", { message });
  };
}
