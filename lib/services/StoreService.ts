import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonParse, safeJsonStringify } from "@/lib/utils/helpers";
import { NotFoundError, ValidationError, ConflictError } from "@/lib/utils/errors";
import { STORE_STATUS } from "@/lib/utils/constants";
import type { Store, Address } from "@/types/entities";

export class StoreService {
  // Create a new store
  async createStore(data: {
    sellerId: string;
    name: string;
    description?: string;
    category: string;
    address: Address;
    contactPhone: string;
    contactEmail: string;
    logo?: string;
    coverImage?: string;
  }): Promise<string> {
    const storeId = id();
    const now = Date.now();

    // Check if seller already has a store
    const existingStores = await db.query({
      stores: {
        $: { where: { sellerId: data.sellerId } },
      },
    });

    if (existingStores.data?.stores && existingStores.data.stores.length > 0) {
      throw new ConflictError("Seller already has a store");
    }

    db.transact(
      db.tx.stores[storeId].update({
        sellerId: data.sellerId,
        name: data.name,
        description: data.description || null,
        category: data.category,
        address: safeJsonStringify(data.address),
        contactPhone: data.contactPhone,
        contactEmail: data.contactEmail,
        logo: data.logo || null,
        coverImage: data.coverImage || null,
        status: STORE_STATUS.PENDING,
        isFeatured: false,
        rating: null,
        reviewCount: 0,
        createdAt: now,
        updatedAt: now,
      })
    );

    return storeId;
  }

  // Get store by ID
  async getStoreById(storeId: string): Promise<Store | null> {
    const result = await db.query({
      stores: {
        $: { where: { id: storeId } },
      },
    });

    const store = result.data?.stores?.[0];
    if (!store) return null;

    return this.mapStore(store);
  }

  // Get store by seller ID
  async getStoreBySellerId(sellerId: string): Promise<Store | null> {
    const result = await db.query({
      stores: {
        $: { where: { sellerId } },
      },
    });

    const store = result.data?.stores?.[0];
    if (!store) return null;

    return this.mapStore(store);
  }

  // Update store
  async updateStore(storeId: string, data: Partial<Store>): Promise<void> {
    const store = await this.getStoreById(storeId);
    if (!store) {
      throw new NotFoundError("Store");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (data.name) updates.name = data.name;
    if (data.description !== undefined) updates.description = data.description || null;
    if (data.category) updates.category = data.category;
    if (data.address) updates.address = safeJsonStringify(data.address);
    if (data.contactPhone) updates.contactPhone = data.contactPhone;
    if (data.contactEmail) updates.contactEmail = data.contactEmail;
    if (data.logo !== undefined) updates.logo = data.logo || null;
    if (data.coverImage !== undefined) updates.coverImage = data.coverImage || null;
    if (data.status) updates.status = data.status;

    db.transact(db.tx.stores[storeId].update(updates));
  }

  // Search stores
  async searchStores(filters: {
    category?: string;
    pincode?: string;
    area?: string;
    ward?: string;
    landmark?: string;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ stores: Store[]; total: number }> {
    const limit = filters.limit || 20;
    const skip = ((filters.page || 1) - 1) * limit;

    // Build where clause
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.category) where.category = filters.category;

    const result = await db.query({
      stores: {
        $: {
          where,
        },
      },
    });

    let stores = result.data?.stores || [];

    // Filter by address fields (since address is JSON, we filter in memory)
    if (filters.pincode || filters.area || filters.ward || filters.landmark) {
      stores = stores.filter((store: any) => {
        const address = safeJsonParse<Address>(store.address);
        if (!address) return false;
        if (filters.pincode && address.pincode !== filters.pincode) return false;
        if (filters.area && address.area !== filters.area) return false;
        if (filters.ward && address.ward !== filters.ward) return false;
        if (filters.landmark && address.landmark !== filters.landmark) return false;
        return true;
      });
    }

    const total = stores.length;
    const paginatedStores = stores.slice(skip, skip + limit);

    return {
      stores: paginatedStores.map((store: any) => this.mapStore(store)),
      total,
    };
  }

  // Approve/reject store (admin only)
  async approveStore(storeId: string, approved: boolean, adminId: string, reason?: string): Promise<void> {
    const store = await this.getStoreById(storeId);
    if (!store) {
      throw new NotFoundError("Store");
    }

    const updates: any = {
      status: approved ? STORE_STATUS.APPROVED : STORE_STATUS.REJECTED,
      updatedAt: Date.now(),
      approvedAt: approved ? Date.now() : null,
      approvedBy: approved ? adminId : null,
    };

    db.transact(db.tx.stores[storeId].update(updates));
  }

  // Get pending stores
  async getPendingStores(): Promise<Store[]> {
    const result = await db.query({
      stores: {
        $: {
          where: { status: STORE_STATUS.PENDING },
        },
      },
    });

    const stores = result.data?.stores || [];
    return stores.map((store: any) => this.mapStore(store));
  }

  // Map database store to entity
  private mapStore(store: any): Store {
    return {
      id: store.id,
      sellerId: store.sellerId,
      name: store.name,
      description: store.description || undefined,
      category: store.category,
      address: safeJsonParse<Address>(store.address) || {
        area: "",
        pincode: "",
      },
      contactPhone: store.contactPhone,
      contactEmail: store.contactEmail,
      logo: store.logo || undefined,
      coverImage: store.coverImage || undefined,
      status: store.status as any,
      isFeatured: store.isFeatured || false,
      featuredUntil: store.featuredUntil || undefined,
      geoLocation: store.geoLocation ? safeJsonParse(store.geoLocation) : undefined,
      rating: store.rating || undefined,
      reviewCount: store.reviewCount || undefined,
      createdAt: store.createdAt,
      updatedAt: store.updatedAt,
      approvedAt: store.approvedAt || undefined,
      approvedBy: store.approvedBy || undefined,
    };
  }
}

export const storeService = new StoreService();

