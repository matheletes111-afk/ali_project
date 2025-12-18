import { z } from "zod";
import { ValidationError } from "@/lib/utils/errors";
import { ITEM_STATUS } from "@/lib/utils/constants";

export const productVariantSchema = z.object({
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Variant name is required"),
  attributes: z.record(z.string()).optional(),
  price: z.number().positive("Price must be positive"),
  compareAtPrice: z.number().positive().optional(),
  stock: z.number().int().min(-1, "Stock must be -1 (unlimited) or 0+"),
  isAvailable: z.boolean().default(true),
  images: z.array(z.string().url()).optional(),
});

export const productCreateSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  images: z.array(z.string().url()).min(1, "At least one image is required"),
  variants: z.array(productVariantSchema).min(1, "At least one variant is required"),
});

export const productUpdateSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  images: z.array(z.string().url()).optional(),
  status: z.enum([
    ITEM_STATUS.DRAFT,
    ITEM_STATUS.ACTIVE,
    ITEM_STATUS.INACTIVE,
    ITEM_STATUS.ARCHIVED,
  ]).optional(),
  variants: z.array(
    productVariantSchema.extend({
      id: z.string().optional(), // For updates
    })
  ).optional(),
});

export function validateProductCreate(data: unknown) {
  try {
    return productCreateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

export function validateProductUpdate(data: unknown) {
  try {
    return productUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

