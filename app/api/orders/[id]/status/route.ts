import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";
import { validateOrderStatusUpdate } from "@/lib/validators/order";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { OrderStatusUpdateRequest } from "@/types/api";

async function handler(req: NextRequest, context: any, orderId: string) {
  try {
    const body: OrderStatusUpdateRequest = await req.json();
    const validated = validateOrderStatusUpdate(body);

    // Verify ownership
    const order = await orderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { success: false, error: "Seller not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreById(order.storeId);
    if (!store || store.sellerId !== seller.id) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await orderService.updateOrderStatus(orderId, validated.status);

    const updatedOrder = await orderService.getOrderById(orderId);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update order status" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withSeller(async (req, context) => {
  const url = new URL(req.url);
  const orderId = url.pathname.split("/")[url.pathname.split("/").length - 2];
  return handler(req, context, orderId);
});

