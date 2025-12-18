import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonParse, safeJsonStringify } from "@/lib/utils/helpers";
import { NotFoundError } from "@/lib/utils/errors";
import { ITEM_STATUS } from "@/lib/utils/constants";
import type { Service } from "@/types/entities";

export class ServiceService {
  // Create service
  async createService(data: {
    storeId: string;
    title: string;
    description?: string;
    category: string;
    images: string[];
    duration: number;
    basePrice: number;
    priceVariants?: Array<{ name: string; price: number; duration?: number }>;
    availability?: any;
    locationType: "at_store" | "at_customer" | "remote";
  }): Promise<string> {
    const serviceId = id();
    const now = Date.now();

    db.transact(
      db.tx.services[serviceId].update({
        storeId: data.storeId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        images: safeJsonStringify(data.images),
        duration: data.duration,
        basePrice: data.basePrice,
        priceVariants: data.priceVariants ? safeJsonStringify(data.priceVariants) : null,
        availability: data.availability ? safeJsonStringify(data.availability) : null,
        locationType: data.locationType,
        status: ITEM_STATUS.DRAFT,
        isDraft: true,
        createdAt: now,
        updatedAt: now,
      })
    );

    return serviceId;
  }

  // Get service by ID
  async getServiceById(serviceId: string): Promise<Service | null> {
    const result = await db.query({
      services: {
        $: { where: { id: serviceId } },
      },
    });

    const service = result.data?.services?.[0];
    if (!service) return null;

    return this.mapService(service);
  }

  // Get services by store
  async getServicesByStore(
    storeId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<{ services: Service[]; total: number }> {
    const where: any = { storeId };
    if (filters?.status) where.status = filters.status;

    const result = await db.query({
      services: {
        $: { where },
      },
    });

    const services = result.data?.services || [];
    const total = services.length;

    // Pagination
    const limit = filters?.limit || 20;
    const skip = ((filters?.page || 1) - 1) * limit;
    const paginated = services.slice(skip, skip + limit);

    return {
      services: paginated.map((s: any) => this.mapService(s)),
      total,
    };
  }

  // Update service
  async updateService(serviceId: string, data: Partial<Service>): Promise<void> {
    const service = await this.getServiceById(serviceId);
    if (!service) {
      throw new NotFoundError("Service");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (data.title) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description || null;
    if (data.category) updates.category = data.category;
    if (data.images) updates.images = safeJsonStringify(data.images);
    if (data.duration !== undefined) updates.duration = data.duration;
    if (data.basePrice !== undefined) updates.basePrice = data.basePrice;
    if (data.priceVariants) updates.priceVariants = safeJsonStringify(data.priceVariants);
    if (data.availability) updates.availability = safeJsonStringify(data.availability);
    if (data.locationType) updates.locationType = data.locationType;
    if (data.status) updates.status = data.status;
    if (data.isDraft !== undefined) updates.isDraft = data.isDraft;

    db.transact(db.tx.services[serviceId].update(updates));
  }

  // Delete service (soft delete)
  async deleteService(serviceId: string): Promise<void> {
    await this.updateService(serviceId, { status: ITEM_STATUS.ARCHIVED });
  }

  private mapService(service: any): Service {
    return {
      id: service.id,
      storeId: service.storeId,
      title: service.title,
      description: service.description || undefined,
      category: service.category,
      images: safeJsonParse<string[]>(service.images) || [],
      duration: service.duration,
      basePrice: service.basePrice,
      priceVariants: service.priceVariants
        ? safeJsonParse<Array<{ name: string; price: number; duration?: number }>>(
            service.priceVariants
          )
        : undefined,
      availability: service.availability ? safeJsonParse(service.availability) : undefined,
      locationType: service.locationType as any,
      status: service.status as any,
      isDraft: service.isDraft || false,
      createdAt: service.createdAt,
      updatedAt: service.updatedAt,
    };
  }
}

export const serviceService = new ServiceService();

