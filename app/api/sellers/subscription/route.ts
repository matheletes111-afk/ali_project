import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { subscriptionService } from "@/lib/services/SubscriptionService";
import { authService } from "@/lib/services/AuthService";
import type { SubscriptionUpdateRequest, SubscriptionUpdateResponse } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const body: SubscriptionUpdateRequest = await req.json();
    const { planId } = body;

    if (!planId) {
      return NextResponse.json(
        { success: false, message: "Plan ID is required" },
        { status: 400 }
      );
    }

    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Seller not found" },
        { status: 404 }
      );
    }

    await subscriptionService.updateSellerSubscription(seller.id, planId);

    const plan = await subscriptionService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, message: "Plan not found" },
        { status: 404 }
      );
    }

    const response: SubscriptionUpdateResponse = {
      success: true,
      subscription: {
        planId: plan.id,
        planName: plan.name,
        status: "active",
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Update subscription error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update subscription" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withSeller(handler);

