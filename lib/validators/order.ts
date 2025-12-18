import { z } from "zod";
import { ValidationError } from "@/lib/utils/errors";
import { ORDER_TYPES, ORDER_STATUS, PAYMENT_STATUS } from "@/lib/utils/constants";
import { addressSchema } from "./store";

export const orderItemSchema = z.object({
  productId: z.string().optional(),
  variantId: z.string().optional(),
  serviceId: z.string().optional(),
  quantity: z.number().int().positive("Quantity must be positive"),
}).refine(
  (data) => data.productId || data.serviceId,
  "Either productId or serviceId must be provided"
);

export const orderCreateSchema = z.object({
  storeId: z.string().min(1, "Store ID is required"),
  type: z.enum([ORDER_TYPES.PRODUCT, ORDER_TYPES.SERVICE]),
  items: z.array(orderItemSchema).min(1, "At least one item is required"),
  shippingAddress: addressSchema,
  billingAddress: addressSchema.optional(),
  notes: z.string().optional(),
});

export const orderStatusUpdateSchema = z.object({
  status: z.enum([
    ORDER_STATUS.PENDING,
    ORDER_STATUS.CONFIRMED,
    ORDER_STATUS.PROCESSING,
    ORDER_STATUS.SHIPPED,
    ORDER_STATUS.DELIVERED,
    ORDER_STATUS.CANCELLED,
  ]),
});

export function validateOrderCreate(data: unknown) {
  try {
    return orderCreateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

export function validateOrderStatusUpdate(data: unknown) {
  try {
    return orderStatusUpdateSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new ValidationError("Validation failed", error.flatten().fieldErrors);
    }
    throw error;
  }
}

