import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { validateOnboard } from "@/lib/validators/store";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import { db } from "@/lib/instant/db-server";
import { id } from "@instantdb/admin";
import { safeJsonStringify } from "@/lib/utils/helpers";
import type { OnboardRequest, OnboardResponse } from "@/types/api";
import { DOCUMENT_TYPES } from "@/lib/utils/constants";

async function handler(req: NextRequest, context: any) {
  try {
    const body: OnboardRequest = await req.json();
    const validated = validateOnboard(body);

    // Get or create seller profile
    let seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      const sellerId = await authService.createSeller({
        userId: context.userId,
        ownerName: validated.ownerName,
        businessType: validated.businessType,
      });
      seller = await authService.getSellerByUserId(context.userId);
    }

    if (!seller) {
      return NextResponse.json(
        { success: false, message: "Failed to create seller profile" },
        { status: 500 }
      );
    }

    // Create store
    const storeId = await storeService.createStore({
      sellerId: seller.id,
      name: validated.businessType === "shop" ? validated.ownerName + "'s Shop" : validated.ownerName + "'s Service",
      category: validated.category,
      address: validated.address,
      contactPhone: validated.contactPhone,
      contactEmail: validated.contactEmail,
    });

    // Upload documents
    const now = Date.now();
    const documentTransactions = validated.documents.map((doc) => {
      const docId = id();
      return db.tx.documents[docId].update({
        sellerId: seller!.id,
        type: doc.type || DOCUMENT_TYPES.OTHER,
        fileUrl: doc.fileUrl,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        mimeType: doc.mimeType,
        uploadedAt: now,
      });
    });

    db.transact(documentTransactions);

    const response: OnboardResponse = {
      success: true,
      storeId,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Onboard error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Onboarding failed" },
      { status: error.statusCode || 500 }
    );
  }
}

export const POST = withSeller(handler);

