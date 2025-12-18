import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { serviceService } from "@/lib/services/ServiceService";
import { subscriptionService } from "@/lib/services/SubscriptionService";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import { z } from "zod";
import type { ServiceCreateRequest } from "@/types/api";

const serviceCreateSchema = z.object({
  storeId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: z.string(),
  images: z.array(z.string().url()),
  duration: z.number(),
  basePrice: z.number(),
  priceVariants: z.array(z.object({
    name: z.string(),
    price: z.number(),
    duration: z.number().optional(),
  })).optional(),
  availability: z.any().optional(),
  locationType: z.enum(["at_store", "at_customer", "remote"]),
});

async function handler(req: NextRequest, context: any) {
  try {
    const body: ServiceCreateRequest = await req.json();
    const validated = serviceCreateSchema.parse(body);

    // Verify store ownership
    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreById(validated.storeId);
    if (!store || store.sellerId !== seller.id) {
      return NextResponse.json(
        { success: false, message: "Store not found or unauthorized" },
        { status: 403 }
      );
    }

    // Check subscription limits
    const limitCheck = await subscriptionService.checkServiceLimit(seller.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Service limit reached. Maximum ${limitCheck.max} services allowed.`,
        },
        { status: 402 }
      );
    }

    const serviceId = await serviceService.createService(validated);

    return NextResponse.json({
      success: true,
      serviceId,
    });
  } catch (error: any) {
    console.error("Create service error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create service" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withSeller(handler);

