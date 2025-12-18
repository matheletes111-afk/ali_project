// User Roles
export const USER_ROLES = {
  CUSTOMER: "customer",
  SELLER: "seller",
  ADMIN: "admin",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

// Business Types
export const BUSINESS_TYPES = {
  SHOP: "shop",
  SERVICE: "service",
} as const;

export type BusinessType = (typeof BUSINESS_TYPES)[keyof typeof BUSINESS_TYPES];

// Verification Status
export const VERIFICATION_STATUS = {
  PENDING: "pending",
  VERIFIED: "verified",
  REJECTED: "rejected",
} as const;

export type VerificationStatus =
  (typeof VERIFICATION_STATUS)[keyof typeof VERIFICATION_STATUS];

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  ACTIVE: "active",
  EXPIRED: "expired",
  CANCELLED: "cancelled",
} as const;

export type SubscriptionStatus =
  (typeof SUBSCRIPTION_STATUS)[keyof typeof SUBSCRIPTION_STATUS];

// Store Status
export const STORE_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUSPENDED: "suspended",
} as const;

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];

// Product/Service Status
export const ITEM_STATUS = {
  DRAFT: "draft",
  ACTIVE: "active",
  INACTIVE: "inactive",
  ARCHIVED: "archived",
} as const;

export type ItemStatus = (typeof ITEM_STATUS)[keyof typeof ITEM_STATUS];

// Order Status
export const ORDER_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

// Booking Status
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
} as const;

export type BookingStatus =
  (typeof BOOKING_STATUS)[keyof typeof BOOKING_STATUS];

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed",
  REFUNDED: "refunded",
} as const;

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];

// Review Status
export const REVIEW_STATUS = {
  PENDING: "pending",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export type ReviewStatus =
  (typeof REVIEW_STATUS)[keyof typeof REVIEW_STATUS];

// Document Types
export const DOCUMENT_TYPES = {
  REGISTRATION_CERTIFICATE: "registration_certificate",
  LICENSE: "license",
  OTHER: "other",
} as const;

export type DocumentType =
  (typeof DOCUMENT_TYPES)[keyof typeof DOCUMENT_TYPES];

// Location Types
export const LOCATION_TYPES = {
  AT_STORE: "at_store",
  AT_CUSTOMER: "at_customer",
  REMOTE: "remote",
} as const;

export type LocationType =
  (typeof LOCATION_TYPES)[keyof typeof LOCATION_TYPES];

// Order Types
export const ORDER_TYPES = {
  PRODUCT: "product",
  SERVICE: "service",
} as const;

export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES];

// Default subscription plan IDs (to be created in database)
export const SUBSCRIPTION_PLAN_SLUGS = {
  BASIC: "basic",
  STANDARD: "standard",
  PREMIUM: "premium",
} as const;

// Pagination defaults
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_DOCUMENT_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_DOCUMENT_TYPES: ["application/pdf", "image/jpeg", "image/png"],
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

