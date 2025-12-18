import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonStringify } from "@/lib/utils/helpers";
import { NotFoundError } from "@/lib/utils/errors";
import { storeService } from "./StoreService";
import type { AdminLog } from "@/types/entities";

export class AdminService {
  // Log admin action
  async logAction(data: {
    adminId: string;
    action: string;
    targetType: string;
    targetId: string;
    details?: any;
    ipAddress?: string;
  }): Promise<void> {
    const logId = id();
    const now = Date.now();

    db.transact(
      db.tx.adminLogs[logId].update({
        adminId: data.adminId,
        action: data.action,
        targetType: data.targetType,
        targetId: data.targetId,
        details: data.details ? safeJsonStringify(data.details) : null,
        ipAddress: data.ipAddress || null,
        createdAt: now,
      })
    );
  }

  // Approve store
  async approveStore(storeId: string, adminId: string, approved: boolean, reason?: string, ipAddress?: string): Promise<void> {
    await storeService.approveStore(storeId, approved, adminId, reason);

    await this.logAction({
      adminId,
      action: approved ? "store_approved" : "store_rejected",
      targetType: "store",
      targetId: storeId,
      details: { reason },
      ipAddress,
    });
  }

  // Get platform analytics
  async getAnalytics(): Promise<{
    totalStores: number;
    totalSellers: number;
    totalOrders: number;
    revenue: number;
    pendingApprovals: number;
    activeSubscriptions: number;
  }> {
    const [stores, sellers, orders, pendingStores, activeSubscriptions] = await Promise.all([
      db.query({ stores: {} }),
      db.query({ sellers: {} }),
      db.query({ orders: {} }),
      storeService.getPendingStores(),
      db.query({
        sellers: {
          $: { where: { subscriptionStatus: "active" } },
        },
      }),
    ]);

    const totalStores = stores.data?.stores?.length || 0;
    const totalSellers = sellers.data?.sellers?.length || 0;
    const totalOrders = orders.data?.orders?.length || 0;
    const pendingApprovals = pendingStores.length;
    const activeSubscriptions = activeSubscriptions.data?.sellers?.length || 0;

    // Calculate revenue (sum of all paid orders)
    const allOrders = orders.data?.orders || [];
    const revenue = allOrders
      .filter((o: any) => o.paymentStatus === "paid")
      .reduce((sum: number, o: any) => sum + (o.total || 0), 0);

    return {
      totalStores,
      totalSellers,
      totalOrders,
      revenue,
      pendingApprovals,
      activeSubscriptions,
    };
  }

  // Get all sellers with pagination
  async getSellers(filters?: {
    status?: string;
    verificationStatus?: string;
    page?: number;
    limit?: number;
  }): Promise<{ sellers: any[]; total: number }> {
    const where: any = {};
    if (filters?.status) where.subscriptionStatus = filters.status;
    if (filters?.verificationStatus) where.verificationStatus = filters.verificationStatus;

    const result = await db.query({
      sellers: {
        $: { where },
        users: {},
      },
    });

    const sellers = result.data?.sellers || [];
    const total = sellers.length;

    const limit = filters?.limit || 20;
    const skip = ((filters?.page || 1) - 1) * limit;
    const paginated = sellers.slice(skip, skip + limit);

    return {
      sellers: paginated,
      total,
    };
  }
}

export const adminService = new AdminService();

