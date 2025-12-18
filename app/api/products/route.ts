import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { productService } from "@/lib/services/ProductService";
import { subscriptionService } from "@/lib/services/SubscriptionService";
import { validateProductCreate } from "@/lib/validators/product";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { ProductCreateRequest } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const body: ProductCreateRequest = await req.json();
    const validated = validateProductCreate(body);

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
    const limitCheck = await subscriptionService.checkProductLimit(seller.id);
    if (!limitCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Product limit reached. Maximum ${limitCheck.max} products allowed.`,
        },
        { status: 402 }
      );
    }

    const productId = await productService.createProduct(validated);

    return NextResponse.json({
      success: true,
      productId,
    });
  } catch (error: any) {
    console.error("Create product error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create product" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withSeller(handler);

