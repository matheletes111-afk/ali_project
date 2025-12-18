import { NextRequest, NextResponse } from "next/server";
import { productService } from "@/lib/services/ProductService";
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

    const result = await productService.getProductsByStore(params.storeId, {
      status,
      page,
      limit,
    });

    const response: ProductListResponse = {
      products: result.products,
      total: result.total,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get products by store error:", error);
    return NextResponse.json(
      { error: "Failed to get products" },
      { status: 500 }
    );
  }
}

