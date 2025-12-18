import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/lib/services/AuthService";
import { validateStoreCreate } from "@/lib/validators/store";
import { ValidationError } from "@/lib/utils/errors";
import type { RegisterRequest, RegisterResponse } from "@/types/api";

export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json();
    const { email, name, role, phone } = body;

    if (!email || !name || !role) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    if (role !== "seller" && role !== "customer") {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    const result = await authService.register({ email, name, role, phone });

    const response: RegisterResponse = {
      success: true,
      message: "User registered successfully. Please check your email for verification code.",
      userId: result.userId,
    };

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.statusCode }
      );
    }

    if (error instanceof Error && error.message.includes("already exists")) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: 409 }
      );
    }

    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "Registration failed" },
      { status: 500 }
    );
  }
}

