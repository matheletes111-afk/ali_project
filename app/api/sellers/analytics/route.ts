import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import { orderService } from "@/lib/services/OrderService";
import { productService } from "@/lib/services/ProductService";
import { serviceService } from "@/lib/services/ServiceService";
import type { AnalyticsResponse } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";

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
        { error: "Store not found" },
        { status: 404 }
      );
    }

    // Calculate date range based on period
    const now = Date.now();
    let startDate = now - 30 * 24 * 60 * 60 * 1000; // Default 30 days
    if (period === "7d") startDate = now - 7 * 24 * 60 * 60 * 1000;
    else if (period === "1y") startDate = now - 365 * 24 * 60 * 60 * 1000;

    // Get orders for the store
    const { orders } = await orderService.getOrdersByStore(store.id);
    const filteredOrders = orders.filter((o) => o.createdAt >= startDate);

    const revenue = filteredOrders
      .filter((o) => o.paymentStatus === "paid")
      .reduce((sum, o) => sum + o.total, 0);

    // Get products and services count
    const { products } = await productService.getProductsByStore(store.id);
    const { services } = await serviceService.getServicesByStore(store.id);

    const response: AnalyticsResponse = {
      orders: filteredOrders.length,
      revenue,
      products: products.length,
      services: services.length,
      period,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}

export const GET = withSeller(handler);

