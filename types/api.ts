// API Request/Response Types

import {
  User,
  Seller,
  Store,
  Product,
  Service,
  Order,
  Booking,
  SubscriptionPlan,
  Address,
} from "./entities";

// Auth API Types
export interface RegisterRequest {
  email: string;
  name: string;
  role: "seller" | "customer";
  phone?: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  userId?: string;
}

export interface LoginRequest {
  email: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface VerifyCodeRequest {
  email: string;
  code: string;
}

export interface VerifyCodeResponse {
  success: boolean;
  token?: string;
  user?: UserProfile;
}

export interface UserProfile extends User {
  seller?: SellerProfile;
}

export interface SellerProfile extends Seller {
  store?: StoreProfile;
}

export interface StoreProfile extends Store {}

// Seller API Types
export interface OnboardRequest {
  ownerName: string;
  businessType: "shop" | "service";
  address: Address;
  category: string;
  contactPhone: string;
  contactEmail: string;
  documents: Array<{
    type: string;
    fileUrl: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }>;
}

export interface OnboardResponse {
  success: boolean;
  storeId: string;
}

export interface SubscriptionUpdateRequest {
  planId: string;
}

export interface SubscriptionUpdateResponse {
  success: boolean;
  subscription: SubscriptionInfo;
}

export interface SubscriptionInfo {
  planId: string;
  planName: string;
  status: string;
  expiresAt?: number;
}

export interface AnalyticsResponse {
  orders: number;
  revenue: number;
  products: number;
  services: number;
  period: string;
}

// Store API Types
export interface StoreSearchQuery {
  category?: string;
  pincode?: string;
  area?: string;
  ward?: string;
  landmark?: string;
  page?: number;
  limit?: number;
}

export interface StoreSearchResponse {
  stores: Store[];
  total: number;
  page: number;
}

export interface StoreDetailResponse {
  store: Store;
  products: Product[];
  services: Service[];
}

export interface StoreUpdateRequest {
  name?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  contactPhone?: string;
  contactEmail?: string;
  category?: string;
  address?: Address;
}

// Product API Types
export interface ProductCreateRequest {
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
}

export interface ProductUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  images?: string[];
  status?: string;
  variants?: Array<{
    id?: string;
    sku?: string;
    name?: string;
    attributes?: Record<string, string>;
    price?: number;
    compareAtPrice?: number;
    stock?: number;
    isAvailable?: boolean;
    images?: string[];
  }>;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
}

// Service API Types
export interface ServiceCreateRequest {
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
}

export interface ServiceUpdateRequest {
  title?: string;
  description?: string;
  category?: string;
  images?: string[];
  duration?: number;
  basePrice?: number;
  priceVariants?: Array<{ name: string; price: number; duration?: number }>;
  availability?: any;
  locationType?: "at_store" | "at_customer" | "remote";
  status?: string;
}

// Order API Types
export interface OrderCreateRequest {
  storeId: string;
  type: "product" | "service";
  items: Array<{
    productId?: string;
    variantId?: string;
    serviceId?: string;
    quantity: number;
  }>;
  shippingAddress: Address;
  billingAddress?: Address;
  notes?: string;
}

export interface OrderListResponse {
  orders: Order[];
  total: number;
}

export interface OrderStatusUpdateRequest {
  status: string;
}

// Booking API Types
export interface BookingCreateRequest {
  serviceId: string;
  scheduledAt: number;
  location?: Address | "at_store";
  notes?: string;
}

// Admin API Types
export interface StoreApprovalRequest {
  approved: boolean;
  reason?: string;
}

export interface AdminAnalyticsResponse {
  totalStores: number;
  totalSellers: number;
  totalOrders: number;
  revenue: number;
  pendingApprovals: number;
  activeSubscriptions: number;
}

