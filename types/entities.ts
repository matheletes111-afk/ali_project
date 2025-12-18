// Business Entity Types

export interface Address {
  area: string;
  pincode: string;
  ward?: string;
  landmark?: string;
}

export interface GeoLocation {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  email: string;
  role: "customer" | "seller" | "admin";
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}

export interface Seller {
  id: string;
  userId: string;
  ownerName: string;
  businessType: "shop" | "service";
  verificationStatus: "pending" | "verified" | "rejected";
  subscriptionPlanId?: string;
  subscriptionStatus: "active" | "expired" | "cancelled";
  subscriptionExpiresAt?: number;
  bankAccountDetails?: any; // Encrypted JSON
  createdAt: number;
  updatedAt: number;
}

export interface Store {
  id: string;
  sellerId: string;
  name: string;
  description?: string;
  category: string;
  address: Address;
  contactPhone: string;
  contactEmail: string;
  logo?: string;
  coverImage?: string;
  status: "pending" | "approved" | "rejected" | "suspended";
  isFeatured?: boolean;
  featuredUntil?: number;
  geoLocation?: GeoLocation;
  rating?: number;
  reviewCount?: number;
  createdAt: number;
  updatedAt: number;
  approvedAt?: number;
  approvedBy?: string;
}

export interface Document {
  id: string;
  sellerId: string;
  type: "registration_certificate" | "license" | "other";
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: number;
  verifiedAt?: number;
  verifiedBy?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number; // in cents
  maxProducts: number; // -1 for unlimited
  maxServices: number; // -1 for unlimited
  features: string[]; // JSON array
  commissionRate: number; // percentage
  isFeatured?: boolean;
  analyticsAccess?: boolean;
  priority: number;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface Product {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  category: string;
  images: string[];
  status: "draft" | "active" | "inactive" | "archived";
  isDraft?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  name: string;
  attributes?: Record<string, string>;
  price: number; // in cents
  compareAtPrice?: number;
  stock: number; // -1 for unlimited
  isAvailable: boolean;
  images?: string[];
  createdAt: number;
  updatedAt: number;
}

export interface Service {
  id: string;
  storeId: string;
  title: string;
  description?: string;
  category: string;
  images: string[];
  duration: number; // minutes
  basePrice: number; // in cents
  priceVariants?: Array<{ name: string; price: number; duration?: number }>;
  availability?: any; // Schedule object
  locationType: "at_store" | "at_customer" | "remote";
  status: "draft" | "active" | "inactive" | "archived";
  isDraft?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface OrderItem {
  productId?: string;
  variantId?: string;
  serviceId?: string;
  quantity: number;
  price: number;
  name: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  storeId: string;
  type: "product" | "service";
  status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  shippingAddress?: Address;
  billingAddress?: Address;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  customerId: string;
  serviceId: string;
  storeId: string;
  scheduledAt: number;
  duration: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  price: number;
  location?: Address | "at_store";
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Review {
  id: string;
  customerId: string;
  storeId: string;
  orderId?: string;
  bookingId?: string;
  rating: number;
  comment?: string;
  images?: string[];
  isVerified: boolean;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  updatedAt: number;
}

export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: any;
  ipAddress?: string;
  createdAt: number;
}

