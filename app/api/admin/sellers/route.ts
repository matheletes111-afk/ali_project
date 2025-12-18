import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { adminService } from "@/lib/services/AdminService";

async function handler(req: NextRequest, context: any) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const verificationStatus = searchParams.get("verificationStatus") || undefined;
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!) : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined;

    const result = await adminService.getSellers({
      status,
      verificationStatus,
      page,
      limit,
    });

    return NextResponse.json({
      sellers: result.sellers,
      total: result.total,
    });
  } catch (error) {
    console.error("Get sellers error:", error);
    return NextResponse.json(
      { error: "Failed to get sellers" },
      { status: 500 }
    );
  }
}

export const GET = withAdmin(handler);

