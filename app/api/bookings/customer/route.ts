import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";

async function handler(req: NextRequest, context: any) {
  try {
    const bookings = await orderService.getBookingsByCustomer(context.userId);

    return NextResponse.json({
      bookings,
    });
  } catch (error) {
    console.error("Get customer bookings error:", error);
    return NextResponse.json(
      { error: "Failed to get bookings" },
      { status: 500 }
    );
  }
}

export const GET = withAuth(handler);

