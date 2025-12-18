import { NextRequest, NextResponse } from "next/server";
import { serviceService } from "@/lib/services/ServiceService";
import type { ProductListResponse } from "@/types/api";

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await serviceService.getServicesByStore(params.storeId, {
      status,
      page,
      limit,
    });

    const response: ProductListResponse = {
      products: result.services as any, // Reusing type, but it's services
      total: result.total,
    };

    return NextResponse.json({
      services: result.services,
      total: result.total,
    });
  } catch (error) {
    console.error("Get services by store error:", error);
    return NextResponse.json(
      { error: "Failed to get services" },
      { status: 500 }
    );
  }
}

