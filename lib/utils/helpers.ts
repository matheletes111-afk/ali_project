import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility function for combining classNames
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generate unique order/booking number
export function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `ORD-${timestamp}-${random}`.toUpperCase();
}

export function generateBookingNumber(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `BK-${timestamp}-${random}`.toUpperCase();
}

// Format currency (cents to display format)
export function formatCurrency(cents: number, currency: string = "₹"): string {
  return `${currency}${(cents / 100).toFixed(2)}`;
}

// Parse currency to cents
export function parseCurrency(amount: number): number {
  return Math.round(amount * 100);
}

// Validate email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate phone (Indian format)
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[6-9]\d{9}$/;
  return phoneRegex.test(phone.replace(/\D/g, ""));
}

// Validate pincode (Indian format)
export function isValidPincode(pincode: string): boolean {
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  return pincodeRegex.test(pincode);
}

// Safe JSON parse
export function safeJsonParse<T>(json: string | null | undefined): T | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as T;
  } catch {
    return null;
  }
}

// Safe JSON stringify
export function safeJsonStringify(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return "{}";
  }
}

// Calculate pagination
export function getPaginationParams(
  page?: string | number,
  limit?: string | number
) {
  const pageNum = Math.max(1, parseInt(String(page || 1), 10));
  const limitNum = Math.min(
    100,
    Math.max(1, parseInt(String(limit || 20), 10))
  );
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
}

// Format date to timestamp
export function toTimestamp(date: Date): number {
  return date.getTime();
}

// Format timestamp to date
export function fromTimestamp(timestamp: number): Date {
  return new Date(timestamp);
}

// Check if subscription is active
export function isSubscriptionActive(
  status: string,
  expiresAt?: number | null
): boolean {
  if (status !== "active") return false;
  if (!expiresAt) return true; // No expiry means lifetime
  return expiresAt > Date.now();
}

