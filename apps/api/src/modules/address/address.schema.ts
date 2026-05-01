import { z } from "zod";

export const addressCoreSchema = z.object({
  flatRoom: z.string().trim().optional(),
  isDefault: z.boolean().optional(),
  label: z.string().trim().min(1, "Label is required"),
  landmarkDescription: z.string().trim().min(10, "Landmark description must be at least 10 characters"),
  lat: z.union([z.string(), z.number()]).optional(),
  lng: z.union([z.string(), z.number()]).optional(),
});

export const createAddressSchema = {
  body: addressCoreSchema,
};

export const updateAddressSchema = {
  body: addressCoreSchema.partial().refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided to update"
  ),
  params: z.object({
    id: z.string().min(1, "Address ID is required"),
  }),
};

export const addressIdParamsSchema = {
  params: z.object({
    id: z.string().min(1, "Address ID is required"),
  }),
};

export type CreateAddressBody = z.infer<typeof addressCoreSchema>;
// Partial body without the refine constraint for type inference
export type UpdateAddressBody = Partial<CreateAddressBody>;
export type AddressIdParams = z.infer<typeof addressIdParamsSchema.params>;
