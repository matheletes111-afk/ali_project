import { db } from "@/lib/instant/db";
import { id } from "@instantdb/react";
import { safeJsonParse, safeJsonStringify } from "@/lib/utils/helpers";
import { NotFoundError, AuthorizationError } from "@/lib/utils/errors";
import { ITEM_STATUS } from "@/lib/utils/constants";
import type { Product, ProductVariant } from "@/types/entities";

export class ProductService {
  // Create product with variants
  async createProduct(data: {
    storeId: string;
    title: string;
    description?: string;
    category: string;
    images: string[];
    variants: Array<{
      sku: string;
      name: string;
      attributes?: Record<string, string>;
      price: number;
      compareAtPrice?: number;
      stock: number;
      images?: string[];
    }>;
  }): Promise<string> {
    const productId = id();
    const now = Date.now();

    db.transact(
      db.tx.products[productId].update({
        storeId: data.storeId,
        title: data.title,
        description: data.description || null,
        category: data.category,
        images: safeJsonStringify(data.images),
        status: ITEM_STATUS.DRAFT,
        isDraft: true,
        createdAt: now,
        updatedAt: now,
      })
    );

    // Create variants
    const variantTransactions = data.variants.map((variant) => {
      const variantId = id();
      return db.tx.productVariants[variantId].update({
        productId,
        sku: variant.sku,
        name: variant.name,
        attributes: variant.attributes ? safeJsonStringify(variant.attributes) : null,
        price: variant.price,
        compareAtPrice: variant.compareAtPrice || null,
        stock: variant.stock,
        isAvailable: true,
        images: variant.images ? safeJsonStringify(variant.images) : null,
        createdAt: now,
        updatedAt: now,
      });
    });

    db.transact(variantTransactions);

    return productId;
  }

  // Get product by ID
  async getProductById(productId: string): Promise<Product | null> {
    const result = await db.query({
      products: {
        $: { where: { id: productId } },
        productVariants: {},
      },
    });

    const product = result.data?.products?.[0];
    if (!product) return null;

    return this.mapProduct(product);
  }

  // Get products by store
  async getProductsByStore(
    storeId: string,
    filters?: { status?: string; page?: number; limit?: number }
  ): Promise<{ products: Product[]; total: number }> {
    const where: any = { storeId };
    if (filters?.status) where.status = filters.status;

    const result = await db.query({
      products: {
        $: { where },
        productVariants: {},
      },
    });

    const products = result.data?.products || [];
    const total = products.length;

    // Pagination
    const limit = filters?.limit || 20;
    const skip = ((filters?.page || 1) - 1) * limit;
    const paginated = products.slice(skip, skip + limit);

    return {
      products: paginated.map((p: any) => this.mapProduct(p)),
      total,
    };
  }

  // Update product
  async updateProduct(productId: string, data: Partial<Product>): Promise<void> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new NotFoundError("Product");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (data.title) updates.title = data.title;
    if (data.description !== undefined) updates.description = data.description || null;
    if (data.category) updates.category = data.category;
    if (data.images) updates.images = safeJsonStringify(data.images);
    if (data.status) updates.status = data.status;
    if (data.isDraft !== undefined) updates.isDraft = data.isDraft;

    db.transact(db.tx.products[productId].update(updates));
  }

  // Delete product (soft delete by setting status)
  async deleteProduct(productId: string): Promise<void> {
    await this.updateProduct(productId, { status: ITEM_STATUS.ARCHIVED });
  }

  // Get product variants
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const result = await db.query({
      productVariants: {
        $: { where: { productId } },
      },
    });

    const variants = result.data?.productVariants || [];
    return variants.map((v: any) => this.mapVariant(v));
  }

  // Update product variant
  async updateVariant(variantId: string, data: Partial<ProductVariant>): Promise<void> {
    const result = await db.query({
      productVariants: {
        $: { where: { id: variantId } },
      },
    });

    const variant = result.data?.productVariants?.[0];
    if (!variant) {
      throw new NotFoundError("Product variant");
    }

    const updates: any = {
      updatedAt: Date.now(),
    };

    if (data.sku) updates.sku = data.sku;
    if (data.name) updates.name = data.name;
    if (data.attributes) updates.attributes = safeJsonStringify(data.attributes);
    if (data.price !== undefined) updates.price = data.price;
    if (data.compareAtPrice !== undefined) updates.compareAtPrice = data.compareAtPrice || null;
    if (data.stock !== undefined) updates.stock = data.stock;
    if (data.isAvailable !== undefined) updates.isAvailable = data.isAvailable;
    if (data.images) updates.images = safeJsonStringify(data.images);

    db.transact(db.tx.productVariants[variantId].update(updates));
  }

  private mapProduct(product: any): Product {
    return {
      id: product.id,
      storeId: product.storeId,
      title: product.title,
      description: product.description || undefined,
      category: product.category,
      images: safeJsonParse<string[]>(product.images) || [],
      status: product.status as any,
      isDraft: product.isDraft || false,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  private mapVariant(variant: any): ProductVariant {
    return {
      id: variant.id,
      productId: variant.productId,
      sku: variant.sku,
      name: variant.name,
      attributes: variant.attributes ? safeJsonParse<Record<string, string>>(variant.attributes) : undefined,
      price: variant.price,
      compareAtPrice: variant.compareAtPrice || undefined,
      stock: variant.stock,
      isAvailable: variant.isAvailable,
      images: variant.images ? safeJsonParse<string[]>(variant.images) : undefined,
      createdAt: variant.createdAt,
      updatedAt: variant.updatedAt,
    };
  }
}

export const productService = new ProductService();

