import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { VerifyCodeRequest, VerifyCodeResponse, UserProfile } from "@/types/api";

// Note: In production, you would verify the code with Instant DB
// For now, this is a simplified version

export async function POST(req: NextRequest) {
  try {
    const body: VerifyCodeRequest = await req.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { success: false, message: "Email and code are required" },
        { status: 400 }
      );
    }

    // In production, verify code with Instant DB magic code auth
    // For now, we'll accept any code (you'd replace this with actual verification)
    if (code.length < 4) {
      return NextResponse.json(
        { success: false, message: "Invalid code" },
        { status: 400 }
      );
    }

    const user = await authService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate JWT token
    const token = authService.generateUserToken(user);

    // Get seller profile if user is a seller
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

    const response: VerifyCodeResponse = {
      success: true,
      token,
      user: userProfile,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Verify code error:", error);
    return NextResponse.json(
      { success: false, message: "Verification failed" },
      { status: 500 }
    );
  }
}

