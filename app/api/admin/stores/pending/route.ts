import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { storeService } from "@/lib/services/StoreService";

async function handler(req: NextRequest, context: any) {
  try {
    const stores = await storeService.getPendingStores();

    return NextResponse.json({
      stores,
    });
  } catch (error) {
    console.error("Get pending stores error:", error);
    return NextResponse.json(
      { error: "Failed to get pending stores" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);

