import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";

async function handler(req: NextRequest, context: any) {
  try {
    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { error: "Seller profile not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreBySellerId(seller.id);

    return NextResponse.json({
      seller: {
        ...seller,
        store: store || undefined,
      },
    });
  } catch (error) {
    console.error("Get seller profile error:", error);
    return NextResponse.json(
      { error: "Failed to get seller profile" },
      { status: 500 }
    );
  }
}

export const GET = withSeller(handler);

