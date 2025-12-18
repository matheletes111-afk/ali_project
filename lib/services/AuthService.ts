// Use server-side database for API routes
import { db } from "@/lib/instant/db-server";
import { id } from "@instantdb/admin";
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
    try {
      // For now, we'll create a userProfile with a generated userId
      // In production, you'd link this to Instant DB's $users entity after auth
      const userId = id();
      const now = Date.now();

      // Check if userProfile already exists for this email
      const existing = await db.query({
        userProfiles: {
          $: { where: { email: data.email } },
        },
      });

      if (existing.data?.userProfiles && existing.userProfiles.length > 0) {
        throw new ConflictError("User with this email already exists");
      }

      // Create userProfile transaction
      // Note: Don't include optional fields if they're null/undefined
      const userData: any = {
        userId: userId, // In production, this should be $users.id from Instant DB auth
        email: data.email,
        role: data.role,
        name: data.name,
        createdAt: now,
        updatedAt: now,
      };

      // Only include optional fields if they have values
      if (data.phone) {
        userData.phone = data.phone;
      }
      // avatar and deletedAt are optional, omit them if null

      const transaction = db.tx.userProfiles[userId].update(userData);

      // Execute transaction - Admin SDK's transact returns a promise
      await db.transact(transaction);

      return { userId };
    } catch (error: any) {
      console.error("Registration error in AuthService:", error);
      // Re-throw with more context
      if (error instanceof ConflictError) {
        throw error;
      }
      throw new Error(`Failed to register user: ${error?.message || "Unknown error"}`);
    }
  }

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const result = await db.query({
      userProfiles: {
        $: { where: { userId } },
      },
    });

    const profile = result.data?.userProfiles?.[0];
    if (!profile) return null;

    return this.mapUser(profile);
  }

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const result = await db.query({
      userProfiles: {
        $: { where: { email } },
      },
    });

    const profile = result.data?.userProfiles?.[0];
    if (!profile) return null;

    return this.mapUser(profile);
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

    await db.transact(
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

  private mapUser(profile: any): User {
    return {
      id: profile.id,
      email: profile.email,
      role: profile.role as any,
      name: profile.name,
      phone: profile.phone || undefined,
      avatar: profile.avatar || undefined,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
      deletedAt: profile.deletedAt || undefined,
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

