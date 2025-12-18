// Docs: https://www.instantdb.com/docs/modeling-data

import { i } from "@instantdb/react";

const _schema = i.schema({
  entities: {
    $files: i.entity({
      path: i.string().unique().indexed(),
      url: i.string(),
    }),
    $users: i.entity({
      email: i.string().unique().indexed().optional(),
      imageURL: i.string().optional(),
      type: i.string().optional(),
    }),
    // Application-specific entities
    userProfiles: i.entity({
      userId: i.string().indexed(), // Links to $users.id
      email: i.string().unique().indexed(), // Store email for lookup
      role: i.string(), // 'customer' | 'seller' | 'admin'
      name: i.string(),
      phone: i.string().optional(),
      avatar: i.string().optional(),
      createdAt: i.number(),
      updatedAt: i.number(),
      deletedAt: i.number().optional(),
    }),
    sellers: i.entity({
      userId: i.string().indexed(),
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
      sellerId: i.string().indexed(),
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
      sellerId: i.string().indexed(),
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
      slug: i.string().unique().indexed(),
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
      storeId: i.string().indexed(),
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
      productId: i.string().indexed(),
      sku: i.string().unique().indexed(),
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
      storeId: i.string().indexed(),
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
      orderNumber: i.string().unique().indexed(),
      customerId: i.string().indexed(),
      storeId: i.string().indexed(),
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
      bookingNumber: i.string().unique().indexed(),
      customerId: i.string().indexed(),
      serviceId: i.string().indexed(),
      storeId: i.string().indexed(),
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
      customerId: i.string().indexed(),
      storeId: i.string().indexed(),
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
      adminId: i.string().indexed(),
      action: i.string(),
      targetType: i.string(),
      targetId: i.string(),
      details: i.string().optional(), // JSON string
      ipAddress: i.string().optional(),
      createdAt: i.number(),
    }),
  },
  links: {
    $usersLinkedPrimaryUser: {
      forward: {
        on: "$users",
        has: "one",
        label: "linkedPrimaryUser",
        onDelete: "cascade",
      },
      reverse: {
        on: "$users",
        has: "many",
        label: "linkedGuestUsers",
      },
    },
  },
  rooms: {},
});

// This helps Typescript display nicer intellisense
type _AppSchema = typeof _schema;
interface AppSchema extends _AppSchema {}
const schema: AppSchema = _schema;

export type { AppSchema };
export default schema;
