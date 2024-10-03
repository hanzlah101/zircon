import { useMutation, MutationOptions } from "@tanstack/react-query";
import type {
  TAnyZodSafeFunctionHandler,
  inferServerActionError,
  inferServerActionInput,
  inferServerActionReturnData,
  inferServerActionReturnType,
} from "zsa";

export const useServerAction = <
  THandler extends TAnyZodSafeFunctionHandler,
  TReturnError extends boolean = false,
>(
  action: THandler,
  options?: Omit<
    MutationOptions<
      TReturnError extends false
        ? inferServerActionReturnData<THandler>
        : inferServerActionReturnType<THandler>,
      inferServerActionError<THandler>,
      inferServerActionInput<THandler>
    >,
    "mutationFn"
  >,
) => {
  const mutation = useMutation<
    TReturnError extends false
      ? inferServerActionReturnData<THandler>
      : inferServerActionReturnType<THandler>,
    inferServerActionError<THandler>,
    inferServerActionInput<THandler>
  >({
    mutationFn: async (input) => {
      const [data, err] = await action(input);
      if (err) throw err;
      return data;
    },
    ...options,
  });

  type Input =
    inferServerActionInput<THandler> extends undefined
      ? void
      : inferServerActionInput<THandler>;

  const customMutate = (input: Input) => {
    return mutation.mutate(input as inferServerActionInput<THandler>);
  };

  return {
    ...mutation,
    mutate: customMutate,
  };
};
