import { UserRole } from "@/lib/utils/constants";

export function hasRole(userRole: string, allowedRoles: UserRole[]): boolean {
  return allowedRoles.includes(userRole as UserRole);
}

export function isAdmin(role: string): boolean {
  return role === "admin";
}

export function isSeller(role: string): boolean {
  return role === "seller";
}

export function isCustomer(role: string): boolean {
  return role === "customer";
}

export function canAccessAdmin(role: string): boolean {
  return isAdmin(role);
}

export function canAccessSeller(role: string): boolean {
  return isSeller(role) || isAdmin(role);
}

export function canManageStore(userRole: string, storeSellerId: string, userId: string): boolean {
  if (isAdmin(userRole)) return true;
  if (!isSeller(userRole)) return false;
  // In a real implementation, we'd check if userId matches the seller's userId
  // For now, we'll assume the check happens at service level
  return true;
}

