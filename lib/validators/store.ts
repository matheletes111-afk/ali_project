import { z } from "zod";
import { ValidationError } from "@/lib/utils/errors";
import { isValidPincode, isValidPhone, isValidEmail } from "@/lib/utils/helpers";
import { BUSINESS_TYPES, STORE_STATUS } from "@/lib/utils/constants";

export const addressSchema = z.object({
  area: z.string().min(1, "Area is required"),
  pincode: z.string().refine(isValidPincode, "Invalid pincode format"),
  ward: z.string().optional(),
  landmark: z.string().optional(),
});

export const storeCreateSchema = z.object({
  sellerId: z.string().min(1, "Seller ID is required"),
  name: z.string().min(1, "Store name is required").max(200, "Store name too long"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  address: addressSchema,
  contactPhone: z.string().refine(isValidPhone, "Invalid phone number"),
  contactEmail: z.string().email("Invalid email address"),
  logo: z.string().url("Invalid logo URL").optional(),
  coverImage: z.string().url("Invalid cover image URL").optional(),
});

export const storeUpdateSchema = storeCreateSchema.partial().omit({ sellerId: true });

export const onboardSchema = z.object({
  ownerName: z.string().min(1, "Owner name is required"),
  businessType: z.enum([BUSINESS_TYPES.SHOP, BUSINESS_TYPES.SERVICE]),
  address: addressSchema,
  category: z.string().min(1, "Category is required"),
  contactPhone: z.string().refine(isValidPhone, "Invalid phone number"),
  contactEmail: z.string().email("Invalid email address"),
  documents: z.array(
    z.object({
      type: z.string(),
      fileUrl: z.string().url(),
      fileName: z.string(),
      fileSize: z.number().positive(),
      mimeType: z.string(),
    })
  ).min(1, "At least one document is required"),
});

export function validateStoreCreate(data: unknown) {
  try {
    return storeCreateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

export function validateStoreUpdate(data: unknown) {
  try {
    return storeUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

export function validateOnboard(data: unknown) {
  try {
    return onboardSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

