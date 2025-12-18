import { NextRequest, NextResponse } from "next/server";
import { withAdmin } from "@/lib/auth/middleware";
import { subscriptionService } from "@/lib/services/SubscriptionService";
import { db } from "@/lib/instant/db-server";
import { safeJsonStringify } from "@/lib/utils/helpers";
import { z } from "zod";

const updatePlanSchema = z.object({
  name: z.string().optional(),
  price: z.number().optional(),
  maxProducts: z.number().optional(),
  maxServices: z.number().optional(),
  commissionRate: z.number().optional(),
  description: z.string().optional(),
  features: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

async function handler(req: NextRequest, context: any, planId: string) {
  try {
    const body = await req.json();
    const validated = updatePlanSchema.parse(body);

    const plan = await subscriptionService.getPlanById(planId);
    if (!plan) {
      return NextResponse.json(
        { success: false, error: "Plan not found" },
        { status: 404 }
      );
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (validated.name) updates.name = validated.name;
    if (validated.price !== undefined) updates.price = validated.price;
    if (validated.maxProducts !== undefined) updates.maxProducts = validated.maxProducts;
    if (validated.maxServices !== undefined) updates.maxServices = validated.maxServices;
    if (validated.commissionRate !== undefined) updates.commissionRate = validated.commissionRate;
    if (validated.description !== undefined) updates.description = validated.description || null;
    if (validated.features) updates.features = safeJsonStringify(validated.features);
    if (validated.isActive !== undefined) updates.isActive = validated.isActive;

    db.transact(db.tx.subscriptionPlans[planId].update(updates));

    const updatedPlan = await subscriptionService.getPlanById(planId);

    return NextResponse.json({
      success: true,
      plan: updatedPlan,
    });
  } catch (error: any) {
    console.error("Update subscription plan error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update plan" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withAdmin(async (req, context) => {
  const url = new URL(req.url);
  const planId = url.pathname.split("/")[url.pathname.split("/").length - 1];
  return handler(req, context, planId);
});

