import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { OrderListResponse } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    // Get seller's store
    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { error: "Seller not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreBySellerId(seller.id);
    if (!store) {
      return NextResponse.json(
        { orders: [], total: 0 },
        { status: 200 }
      );
    }

    const result = await orderService.getOrdersByStore(store.id, {
      status,
      page,
      limit,
    });

    const response: OrderListResponse = {
      orders: result.orders,
      total: result.total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get seller orders error:", error);
    return NextResponse.json(
      { error: "Failed to get orders" },
      { status: 500 }
    );
  }
}

export const GET = withSeller(handler);

