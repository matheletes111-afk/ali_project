import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonParse, safeJsonStringify, isSubscriptionActive } from "@/lib/utils/helpers";
import { NotFoundError, SubscriptionError } from "@/lib/utils/errors";
import { SUBSCRIPTION_STATUS, SUBSCRIPTION_PLAN_SLUGS } from "@/lib/utils/constants";
import type { SubscriptionPlan } from "@/types/entities";

export class SubscriptionService {
  // Get subscription plan by ID
  async getPlanById(planId: string): Promise<SubscriptionPlan | null> {
    const result = await db.query({
      subscriptionPlans: {
        $: { where: { id: planId } },
      },
    });

    const plan = result.data?.subscriptionPlans?.[0];
    if (!plan) return null;

    return this.mapPlan(plan);
  }

  // Get subscription plan by slug
  async getPlanBySlug(slug: string): Promise<SubscriptionPlan | null> {
    const result = await db.query({
      subscriptionPlans: {
        $: { where: { slug, isActive: true } },
      },
    });

    const plan = result.data?.subscriptionPlans?.[0];
    if (!plan) return null;

    return this.mapPlan(plan);
  }

  // Get all active plans
  async getActivePlans(): Promise<SubscriptionPlan[]> {
    const result = await db.query({
      subscriptionPlans: {
        $: {
          where: { isActive: true },
        },
      },
    });

    const plans = result.data?.subscriptionPlans || [];
    return plans.map((plan: any) => this.mapPlan(plan)).sort((a, b) => a.priority - b.priority);
  }

  // Update seller subscription
  async updateSellerSubscription(
    sellerId: string,
    planId: string,
    expiresAt?: number
  ): Promise<void> {
    const plan = await this.getPlanById(planId);
    if (!plan) {
      throw new NotFoundError("Subscription plan");
    }

    const result = await db.query({
      sellers: {
        $: { where: { id: sellerId } },
      },
    });

    const seller = result.data?.sellers?.[0];
    if (!seller) {
      throw new NotFoundError("Seller");
    }

    const now = Date.now();
    const expiry = expiresAt || (now + 30 * 24 * 60 * 60 * 1000); // 30 days default

    db.transact(
      db.tx.sellers[sellerId].update({
        subscriptionPlanId: planId,
        subscriptionStatus: SUBSCRIPTION_STATUS.ACTIVE,
        subscriptionExpiresAt: expiry,
        updatedAt: now,
      })
    );
  }

  // Check subscription limits
  async checkProductLimit(sellerId: string): Promise<{ allowed: boolean; max: number; current: number }> {
    const result = await db.query({
      sellers: {
        $: { where: { id: sellerId } },
        stores: {
          products: {},
        },
      },
    });

    const seller = result.data?.sellers?.[0];
    if (!seller) {
      throw new NotFoundError("Seller");
    }

    const plan = seller.subscriptionPlanId
      ? await this.getPlanById(seller.subscriptionPlanId)
      : null;

    if (!plan) {
      throw new SubscriptionError("No active subscription plan");
    }

    if (!isSubscriptionActive(seller.subscriptionStatus, seller.subscriptionExpiresAt)) {
      throw new SubscriptionError("Subscription is not active");
    }

    const currentProducts =
      seller.stores?.[0]?.products?.length || 0;
    const max = plan.maxProducts;

    return {
      allowed: max === -1 || currentProducts < max,
      max,
      current: currentProducts,
    };
  }

  // Check service limit
  async checkServiceLimit(sellerId: string): Promise<{ allowed: boolean; max: number; current: number }> {
    const result = await db.query({
      sellers: {
        $: { where: { id: sellerId } },
        stores: {
          services: {},
        },
      },
    });

    const seller = result.data?.sellers?.[0];
    if (!seller) {
      throw new NotFoundError("Seller");
    }

    const plan = seller.subscriptionPlanId
      ? await this.getPlanById(seller.subscriptionPlanId)
      : null;

    if (!plan) {
      throw new SubscriptionError("No active subscription plan");
    }

    if (!isSubscriptionActive(seller.subscriptionStatus, seller.subscriptionExpiresAt)) {
      throw new SubscriptionError("Subscription is not active");
    }

    const currentServices =
      seller.stores?.[0]?.services?.length || 0;
    const max = plan.maxServices;

    return {
      allowed: max === -1 || currentServices < max,
      max,
      current: currentServices,
    };
  }

  // Initialize default subscription plans (call this once on setup)
  async initializeDefaultPlans(): Promise<void> {
    const existingPlans = await db.query({
      subscriptionPlans: {},
    });

    if (existingPlans.data?.subscriptionPlans && existingPlans.data.subscriptionPlans.length > 0) {
      return; // Plans already exist
    }

    const now = Date.now();
    const plans = [
      {
        name: "BASIC",
        slug: SUBSCRIPTION_PLAN_SLUGS.BASIC,
        description: "Basic plan for small businesses",
        price: 0, // Free tier
        maxProducts: 10,
        maxServices: 5,
        features: ["Basic store listing", "Up to 10 products", "Up to 5 services"],
        commissionRate: 15.0,
        isFeatured: false,
        analyticsAccess: false,
        priority: 1,
        isActive: true,
      },
      {
        name: "STANDARD",
        slug: SUBSCRIPTION_PLAN_SLUGS.STANDARD,
        description: "Standard plan for growing businesses",
        price: 99900, // ₹999/month in cents
        maxProducts: 100,
        maxServices: 50,
        features: [
          "Priority listing",
          "Up to 100 products",
          "Up to 50 services",
          "Basic analytics",
        ],
        commissionRate: 12.0,
        isFeatured: true,
        analyticsAccess: true,
        priority: 2,
        isActive: true,
      },
      {
        name: "PREMIUM",
        slug: SUBSCRIPTION_PLAN_SLUGS.PREMIUM,
        description: "Premium plan for established businesses",
        price: 249900, // ₹2499/month in cents
        maxProducts: -1, // Unlimited
        maxServices: -1, // Unlimited
        features: [
          "Featured listing",
          "Unlimited products",
          "Unlimited services",
          "Advanced analytics",
          "Priority support",
        ],
        commissionRate: 10.0,
        isFeatured: true,
        analyticsAccess: true,
        priority: 3,
        isActive: true,
      },
    ];

    const transactions = plans.map((plan) => {
      const planId = id();
      return db.tx.subscriptionPlans[planId].update({
        name: plan.name,
        slug: plan.slug,
        description: plan.description,
        price: plan.price,
        maxProducts: plan.maxProducts,
        maxServices: plan.maxServices,
        features: safeJsonStringify(plan.features),
        commissionRate: plan.commissionRate,
        isFeatured: plan.isFeatured,
        analyticsAccess: plan.analyticsAccess,
        priority: plan.priority,
        isActive: plan.isActive,
        createdAt: now,
        updatedAt: now,
      });
    });

    db.transact(transactions);
  }

  private mapPlan(plan: any): SubscriptionPlan {
    return {
      id: plan.id,
      name: plan.name,
      slug: plan.slug,
      description: plan.description || undefined,
      price: plan.price,
      maxProducts: plan.maxProducts,
      maxServices: plan.maxServices,
      features: safeJsonParse<string[]>(plan.features) || [],
      commissionRate: plan.commissionRate,
      isFeatured: plan.isFeatured || false,
      analyticsAccess: plan.analyticsAccess || false,
      priority: plan.priority,
      isActive: plan.isActive,
      createdAt: plan.createdAt,
      updatedAt: plan.updatedAt,
    };
  }
}

export const subscriptionService = new SubscriptionService();

