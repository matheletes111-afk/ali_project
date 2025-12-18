import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/auth/middleware";
import { orderService } from "@/lib/services/OrderService";
import { z } from "zod";
import type { BookingCreateRequest } from "@/types/api";

const bookingCreateSchema = z.object({
  serviceId: z.string(),
  scheduledAt: z.number(),
  location: z.union([
    z.object({
      area: z.string(),
      pincode: z.string(),
      ward: z.string().optional(),
      landmark: z.string().optional(),
    }),
    z.literal("at_store"),
  ]).optional(),
  notes: z.string().optional(),
});

async function handler(req: NextRequest, context: any) {
  try {
    const body: BookingCreateRequest = await req.json();
    const validated = bookingCreateSchema.parse(body);

    // Get service to get storeId
    const service = await require("@/lib/services/ServiceService").serviceService.getServiceById(validated.serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, message: "Service not found" },
        { status: 404 }
      );
    }

    const bookingId = await orderService.createBooking({
      ...validated,
      customerId: context.userId,
      storeId: service.storeId,
    });

    const booking = await orderService.getBookingById(bookingId);

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error: any) {
    console.error("Create booking error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to create booking" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withAuth(handler);

