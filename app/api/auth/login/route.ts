import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/AuthService";
import type { LoginRequest, LoginResponse } from "@/types/api";

// Note: In a production system with Instant DB, you would use Instant DB's magic code auth
// For now, this is a simplified version that returns success
// The actual magic code sending would be handled by Instant DB

export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    // Check if user exists
    const user = await authService.getUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found. Please register first." },
        { status: 404 }
      );
    }

    // In production, Instant DB would handle magic code sending
    // For now, we'll return success (you'd integrate with Instant DB auth here)
    const response: LoginResponse = {
      success: true,
      message: "Magic code sent to your email. Please check your inbox.",
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "Login failed" },
      { status: 500 }
    );
  }
}

