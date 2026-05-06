import { ValidationError } from "@gorola/shared";
import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long")
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export function parseUpdateProfileInput(body: unknown): UpdateProfileInput {
  const result = updateProfileSchema.safeParse(body);
  if (!result.success) {
    throw new ValidationError("Invalid profile payload", result.error.flatten());
  }
  return result.data;
}
