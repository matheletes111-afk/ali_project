import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { adminService } from "@/lib/services/AdminService";
import type { AdminAnalyticsResponse } from "@/types/api";

async function handler(req: NextRequest, context: any) {
  try {
    const analytics = await adminService.getAnalytics();

    const response: AdminAnalyticsResponse = analytics;

    return NextResponse.json(response);
  } catch (error) {
    console.error("Get admin analytics error:", error);
    return NextResponse.json(
      { error: "Failed to get analytics" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);

