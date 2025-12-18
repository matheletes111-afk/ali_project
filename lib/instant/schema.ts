import { i, schema as instantSchema } from "@instantdb/react";

// Instant DB Schema Definition
export const schema = instantSchema({
  entities: {
    users: i.entity({
      email: i.string(),
      role: i.string(), // 'customer' | 'seller' | 'admin'
      name: i.string(),
      phone: i.string().optional(),
      avatar: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
      deletedAt: i.number().optional(),
    }),
    sellers: i.entity({
      userId: i.string(),
      ownerName: i.string(),
      businessType: i.string(), // 'shop' | 'service'
      verificationStatus: i.string(), // 'pending' | 'verified' | 'rejected'
      subscriptionPlanId: i.string().optional(),
      subscriptionStatus: i.string(), // 'active' | 'expired' | 'cancelled'
      subscriptionExpiresAt: i.number().optional(),
      bankAccountDetails: i.string().optional(), // JSON string, encrypted
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    stores: i.entity({
      sellerId: i.string(),
      name: i.string(),
      description: i.string().optional(),
      category: i.string(),
      address: i.string(), // JSON string
      contactPhone: i.string(),
      contactEmail: i.string(),
      logo: i.string().optional(),
      coverImage: i.string().optional(),
      status: i.string(), // 'pending' | 'approved' | 'rejected' | 'suspended'
      isFeatured: i.boolean().optional(),
      featuredUntil: i.number().optional(),
      geoLocation: i.string().optional(), // JSON string
      rating: i.number().optional(),
      reviewCount: i.number().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
      approvedAt: i.number().optional(),
      approvedBy: i.string().optional(),
    }),
    documents: i.entity({
      sellerId: i.string(),
      type: i.string(), // 'registration_certificate' | 'license' | 'other'
      fileUrl: i.string(),
      fileName: i.string(),
      fileSize: i.number(),
      mimeType: i.string(),
      uploadedAt: i.number(),
      verifiedAt: i.number().optional(),
      verifiedBy: i.string().optional(),
    }),
    subscriptionPlans: i.entity({
      name: i.string(),
      slug: i.string(),
      description: i.string().optional(),
      price: i.number(),
      maxProducts: i.number(),
      maxServices: i.number(),
      features: i.string().optional(), // JSON string
      commissionRate: i.number(),
      isFeatured: i.boolean().optional(),
      analyticsAccess: i.boolean().optional(),
      priority: i.number(),
      isActive: i.boolean(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    products: i.entity({
      storeId: i.string(),
      title: i.string(),
      description: i.string().optional(),
      category: i.string(),
      images: i.string().optional(), // JSON array string
      status: i.string(), // 'draft' | 'active' | 'inactive' | 'archived'
      isDraft: i.boolean().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    productVariants: i.entity({
      productId: i.string(),
      sku: i.string(),
      name: i.string(),
      attributes: i.string().optional(), // JSON string
      price: i.number(),
      compareAtPrice: i.number().optional(),
      stock: i.number(),
      isAvailable: i.boolean(),
      images: i.string().optional(), // JSON array string
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    services: i.entity({
      storeId: i.string(),
      title: i.string(),
      description: i.string().optional(),
      category: i.string(),
      images: i.string().optional(), // JSON array string
      duration: i.number(),
      basePrice: i.number(),
      priceVariants: i.string().optional(), // JSON array string
      availability: i.string().optional(), // JSON string
      locationType: i.string(), // 'at_store' | 'at_customer' | 'remote'
      status: i.string(), // 'draft' | 'active' | 'inactive' | 'archived'
      isDraft: i.boolean().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    orders: i.entity({
      orderNumber: i.string(),
      customerId: i.string(),
      storeId: i.string(),
      type: i.string(), // 'product' | 'service'
      status: i.string(), // 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
      items: i.string(), // JSON array string
      subtotal: i.number(),
      tax: i.number(),
      shipping: i.number(),
      total: i.number(),
      paymentStatus: i.string(), // 'pending' | 'paid' | 'failed' | 'refunded'
      shippingAddress: i.string().optional(), // JSON string
      billingAddress: i.string().optional(), // JSON string
      notes: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    bookings: i.entity({
      bookingNumber: i.string(),
      customerId: i.string(),
      serviceId: i.string(),
      storeId: i.string(),
      scheduledAt: i.number(),
      duration: i.number(),
      status: i.string(), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
      price: i.number(),
      location: i.string().optional(), // JSON string
      notes: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    reviews: i.entity({
      customerId: i.string(),
      storeId: i.string(),
      orderId: i.string().optional(),
      bookingId: i.string().optional(),
      rating: i.number(),
      comment: i.string().optional(),
      images: i.string().optional(), // JSON array string
      isVerified: i.boolean(),
      status: i.string(), // 'pending' | 'approved' | 'rejected'
      createdAt: i.number(),
      updatedAt: i.number(),
    }),
    adminLogs: i.entity({
      adminId: i.string(),
      action: i.string(),
      targetType: i.string(),
      targetId: i.string(),
      details: i.string().optional(), // JSON string
      ipAddress: i.string().optional(),
      createdAt: i.number(),
    }),
  },
});

export type Schema = typeof schema;

