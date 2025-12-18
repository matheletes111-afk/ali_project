import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";
import { validateOrderCreate } from "@/lib/validators/order";
import type { OrderCreateRequest } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const body: OrderCreateRequest = await req.json();
    const validated = validateOrderCreate(body);

    const orderId = await orderService.createOrder({
      ...validated,
      customerId: context.userId,
    });

    const order = await orderService.getOrderById(orderId);

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create order" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withAuth(handler);

