import { NextRequest, NextResponse } from "next/server";
import { verifyToken, extractTokenFromHeader } from "./tokens";
import { AuthenticationError, AuthorizationError } from "@/lib/utils/errors";
import { UserRole } from "@/lib/utils/constants";

export interface AuthContext {
  userId: string;
  email: string;
  role: string;
}

export function withAuth(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return async (req: NextRequest) => {
    try {
      const authHeader = req.headers.get("authorization");
      const token = extractTokenFromHeader(authHeader);

      if (!token) {
        throw new AuthenticationError("No token provided");
      }

      const payload = verifyToken(token);
      const context: AuthContext = {
        userId: payload.userId,
        email: payload.email,
        role: payload.role,
      };

      return await handler(req, context);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return NextResponse.json(
          { error: error.message, code: error.code },
          { status: error.statusCode }
        );
      }
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 401 }
      );
    }
  };
}

export function withRole(
  allowedRoles: UserRole[],
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withAuth(async (req, context) => {
    if (!allowedRoles.includes(context.role as UserRole)) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${allowedRoles.join(", ")}`
      );
    }
    return await handler(req, context);
  });
}

export function withAdmin(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withRole(["admin"], handler);
}

export function withSeller(
  handler: (req: NextRequest, context: AuthContext) => Promise<NextResponse>
) {
  return withRole(["seller", "admin"], handler);
}

// Helper to get auth context from request (for use in API routes)
export async function getAuthContext(req: NextRequest): Promise<AuthContext> {
  const authHeader = req.headers.get("authorization");
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    throw new AuthenticationError("No token provided");
  }

  const payload = verifyToken(token);
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
  };
}

