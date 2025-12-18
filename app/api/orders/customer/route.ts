import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";
import type { OrderListResponse } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await orderService.getOrdersByCustomer(context.userId, {
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
    console.error("Get customer orders error:", error);
    return NextResponse.json(
      { error: "Failed to get orders" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);

