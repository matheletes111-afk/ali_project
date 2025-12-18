import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { subscriptionService } from "@/lib/services/SubscriptionService";

async function handler(req: NextRequest, context: any) {
  try {
    const plans = await subscriptionService.getActivePlans();

    return NextResponse.json({
      plans,
    });
  } catch (error) {
    console.error("Get subscription plans error:", error);
    return NextResponse.json(
      { error: "Failed to get subscription plans" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);

