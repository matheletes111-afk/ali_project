import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { adminService } from "@/lib/services/AdminService";
import { z } from "zod";
import type { StoreApprovalRequest } from "@/types/api";

const approveSchema = z.object({
  approved: z.boolean(),
  reason: z.string().optional(),
});

async function handler(req: NextRequest, context: any, storeId: string) {
  try {
    const body: StoreApprovalRequest = await req.json();
    const validated = approveSchema.parse(body);

    const ipAddress = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || undefined;

    await adminService.approveStore(
      storeId,
      validated.approved,
      context.userId,
      validated.reason,
      ipAddress
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Approve store error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to approve store" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withAdmin(async (req, context) => {
  const url = new URL(req.url);
  const storeId = url.pathname.split("/")[url.pathname.split("/").length - 2];
  return handler(req, context, storeId);
});

