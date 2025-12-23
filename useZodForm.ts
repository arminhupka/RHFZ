import { useForm, type UseFormProps, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ZodTypeAny, infer as zInfer } from "zod";

type ZodFormOptions<TSchema extends ZodTypeAny> = Omit<
  UseFormProps<zInfer<TSchema>>,
  "resolver"
> & {
  schema: TSchema;
};

export function useZodForm<TSchema extends ZodTypeAny>(
  options: ZodFormOptions<TSchema>
): UseFormReturn<zInfer<TSchema>> {
  const { schema, ...rest } = options;

  return useForm<zInfer<TSchema>>({
    ...rest,
    resolver: zodResolver(schema)
  });
}
