import { NextRequest, NextResponse } from "next/server";
import { getAuthContext } from "@/lib/auth/middleware";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { UserProfile } from "@/types/api";

export async function GET(req: NextRequest) {
  try {
    const context = await getAuthContext(req);
    const user = await authService.getUserById(context.userId);

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    let seller = null;
    if (user.role === "seller") {
      seller = await authService.getSellerByUserId(user.id);
      if (seller) {
        const store = await storeService.getStoreBySellerId(seller.id);
        if (store) {
          (seller as any).store = store;
        }
      }
    }

    const userProfile: UserProfile = {
      ...user,
      seller: seller ? { ...seller, store: (seller as any).store } : undefined,
    };

    return NextResponse.json({ user: userProfile });
  } catch (error) {
    console.error("Get me error:", error);
    return NextResponse.json(
      { error: "Failed to get user profile" },
      { status: 500 }
    );
  }
}

