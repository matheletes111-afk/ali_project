import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/lib/services/StoreService";
import { productService } from "@/lib/services/ProductService";
import { serviceService } from "@/lib/services/ServiceService";
import { withSeller } from "@/lib/auth/middleware";
import { validateStoreUpdate } from "@/lib/validators/store";
import type { StoreDetailResponse, StoreUpdateRequest } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const store = await storeService.getStoreById(params.id);
    if (!store) {
      return NextResponse.json(
        { error: "Store not found" },
        { status: 404 }
      );
    }

    const { products } = await productService.getProductsByStore(params.id, {
      status: "active",
    });
    const { services } = await serviceService.getServicesByStore(params.id, {
      status: "active",
    });

    const response: StoreDetailResponse = {
      store,
      products,
      services,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get store error:", error);
    return NextResponse.json(
      { error: "Failed to get store" },
      { status: 500 }
    );
  }
}

async function updateHandler(
  req: NextRequest,
  context: any,
  params: { id: string }
) {
  try {
    const body: StoreUpdateRequest = await req.json();
    const validated = validateStoreUpdate(body);

    // Verify ownership (seller can only update their own store)
    const store = await storeService.getStoreById(params.id);
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Store not found" },
        { status: 404 }
      );
    }

    // Get seller to verify ownership
    const seller = await require("../../../lib/services/AuthService").authService.getSellerByUserId(context.userId);
    if (!seller || seller.id !== store.sellerId) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await storeService.updateStore(params.id, validated as any);

    const updatedStore = await storeService.getStoreById(params.id);

    return NextResponse.json({
      success: true,
      store: updatedStore,
    });
  } catch (error: any) {
    console.error("Update store error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update store" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withSeller(async (req, context) => {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id") || req.url.split("/").pop()?.split("?")[0] || "";
  return updateHandler(req, context, { id });
});

