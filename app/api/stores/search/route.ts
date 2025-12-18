import { NextRequest, NextResponse } from "next/server";
import { storeService } from "@/lib/services/StoreService";
import { STORE_STATUS } from "@/lib/utils/constants";
import type { StoreSearchQuery, StoreSearchResponse } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    
    const filters: StoreSearchQuery = {
      category: searchParams.get("category") || undefined,
      pincode: searchParams.get("pincode") || undefined,
      area: searchParams.get("area") || undefined,
      ward: searchParams.get("ward") || undefined,
      landmark: searchParams.get("landmark") || undefined,
      page: searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined,
    };

    filters.status = STORE_STATUS.APPROVED; // Only show approved stores

    const result = await storeService.searchStores(filters);

    const response: StoreSearchResponse = {
      stores: result.stores,
      total: result.total,
      page: filters.page || 1,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Store search error:", error);
    return NextResponse.json(
      { error: "Failed to search stores" },
      { status: 500 }
    );
  }
}

