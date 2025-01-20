import { z } from "zod";

const FacilityCreateSchema = z
  .object({
    firstName: z.string().min(1, "First name is required").optional(),

    lastName: z.string().min(1, "Last name is required").optional(),
    name: z.string().min(1, "Facility name is required"),
    address: z.string().min(1, "Address is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    zipCode: z
      .string()
      .min(5, "Zip code is required")
      .max(10, "Zip code is too long"),
    phoneNumber: z.string().optional(),
    primaryContact: z.string().min(1, "Primary contact is required"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type FacilityCreate = z.infer<typeof FacilityCreateSchema>;

const ProviderCreateSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  clerkUserId: z.string().min(1, "Clerk user ID is required").optional(),
  imageUrl: z.string().optional(),
  nipNumber: z.string().min(1, "NIP number is required").optional(),
  healthCare: z.boolean().optional(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  email: z.string().email("Invalid email address").optional(),
  facilityId: z.string().min(1, "Facility ID is required").optional(),
});

type ProviderCreate = z.infer<typeof ProviderCreateSchema>;

export { ProviderCreateSchema };
export type { ProviderCreate };

export { FacilityCreateSchema };
export type { FacilityCreate };
export const inferFacilityCreate = FacilityCreateSchema.parse;
