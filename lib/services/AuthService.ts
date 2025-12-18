import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { generateToken } from "@/lib/auth/tokens";
import { NotFoundError, ConflictError } from "@/lib/utils/errors";
import { USER_ROLES } from "@/lib/utils/constants";
import type { User, Seller } from "@/types/entities";

export class AuthService {
  // Register new user
  async register(data: {
    email: string;
    name: string;
    role: "seller" | "customer";
    phone?: string;
  }): Promise<{ userId: string }> {
    // Check if user already exists
    const existing = await db.query({
      users: {
        $: { where: { email: data.email } },
      },
    });

    if (existing.data?.users && existing.data.users.length > 0) {
      throw new ConflictError("User with this email already exists");
    }

    const userId = id();
    const now = Date.now();

    db.transact(
      db.tx.users[userId].update({
        email: data.email,
        role: data.role,
        name: data.name,
        phone: data.phone || null,
        avatar: null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      })
    );

    return { userId };
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const result = await db.query({
      users: {
        $: { where: { id: userId } },
      },
    });

    const user = result.data?.users?.[0];
    if (!user) return null;

    return this.mapUser(user);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.query({
      users: {
        $: { where: { email } },
      },
    });

    const user = result.data?.users?.[0];
    if (!user) return null;

    return this.mapUser(user);
  }

  // Create seller profile
  async createSeller(data: {
    userId: string;
    ownerName: string;
    businessType: "shop" | "service";
  }): Promise<string> {
    // Check if seller already exists
    const existing = await db.query({
      sellers: {
        $: { where: { userId: data.userId } },
      },
    });

    if (existing.data?.sellers && existing.data.sellers.length > 0) {
      throw new ConflictError("Seller profile already exists");
    }

    const sellerId = id();
    const now = Date.now();

    db.transact(
      db.tx.sellers[sellerId].update({
        userId: data.userId,
        ownerName: data.ownerName,
        businessType: data.businessType,
        verificationStatus: "pending",
        subscriptionStatus: "expired",
        createdAt: now,
        updatedAt: now,
      })
    );

    return sellerId;
  }

  // Get seller by user ID
  async getSellerByUserId(userId: string): Promise<Seller | null> {
    const result = await db.query({
      sellers: {
        $: { where: { userId } },
      },
    });

    const seller = result.data?.sellers?.[0];
    if (!seller) return null;

    return this.mapSeller(seller);
  }

  // Generate JWT token for user
  generateUserToken(user: User): string {
    return generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
  }

  private mapUser(user: any): User {
    return {
      id: user.id,
      email: user.email,
      role: user.role as any,
      name: user.name,
      phone: user.phone || undefined,
      avatar: user.avatar || undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt || undefined,
    };
  }

  private mapSeller(seller: any): Seller {
    return {
      id: seller.id,
      userId: seller.userId,
      ownerName: seller.ownerName,
      businessType: seller.businessType as any,
      verificationStatus: seller.verificationStatus as any,
      subscriptionPlanId: seller.subscriptionPlanId || undefined,
      subscriptionStatus: seller.subscriptionStatus as any,
      subscriptionExpiresAt: seller.subscriptionExpiresAt || undefined,
      bankAccountDetails: seller.bankAccountDetails
        ? JSON.parse(seller.bankAccountDetails)
        : undefined,
      createdAt: seller.createdAt,
      updatedAt: seller.updatedAt,
    };
  }
}

export const authService = new AuthService();

