import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { serviceService } from "@/lib/services/ServiceService";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import { z } from "zod";
import type { ServiceUpdateRequest } from "@/types/api";

const serviceUpdateSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  images: z.array(z.string().url()).optional(),
  duration: z.number().optional(),
  basePrice: z.number().optional(),
  priceVariants: z.array(z.object({
    name: z.string(),
    price: z.number(),
    duration: z.number().optional(),
  })).optional(),
  availability: z.any().optional(),
  locationType: z.enum(["at_store", "at_customer", "remote"]).optional(),
  status: z.string().optional(),
});

async function updateHandler(req: NextRequest, context: any, serviceId: string) {
  try {
    const body: ServiceUpdateRequest = await req.json();
    const validated = serviceUpdateSchema.parse(body);

    // Verify ownership
    const service = await serviceService.getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
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

    const store = await storeService.getStoreById(service.storeId);
    if (!store || store.sellerId !== seller.id) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await serviceService.updateService(serviceId, validated as any);

    const updatedService = await serviceService.getServiceById(serviceId);

    return NextResponse.json({
      success: true,
      service: updatedService,
    });
  } catch (error: any) {
    console.error("Update service error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update service" },
      { status: error.statusCode || 500 }
    );
  }
}

async function deleteHandler(req: NextRequest, context: any, serviceId: string) {
  try {
    const service = await serviceService.getServiceById(serviceId);
    if (!service) {
      return NextResponse.json(
        { success: false, error: "Service not found" },
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

    const store = await storeService.getStoreById(service.storeId);
    if (!store || store.sellerId !== seller.id) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await serviceService.deleteService(serviceId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete service error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete service" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withSeller(async (req, context) => {
  const url = new URL(req.url);
  const serviceId = url.pathname.split("/").pop() || "";
  return updateHandler(req, context, serviceId);
});

export const DELETE = withSeller(async (req, context) => {
  const url = new URL(req.url);
  const serviceId = url.pathname.split("/").pop() || "";
  return deleteHandler(req, context, serviceId);
});

