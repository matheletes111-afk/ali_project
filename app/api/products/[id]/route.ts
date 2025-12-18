import { NextRequest, NextResponse } from "next/server";
import { withSeller } from "@/lib/auth/middleware";
import { productService } from "@/lib/services/ProductService";
import { validateProductUpdate } from "@/lib/validators/product";
import { authService } from "@/lib/services/AuthService";
import { storeService } from "@/lib/services/StoreService";
import type { ProductUpdateRequest } from "@/types/api";

async function updateHandler(req: NextRequest, context: any, productId: string) {
  try {
    const body: ProductUpdateRequest = await req.json();
    const validated = validateProductUpdate(body);

    // Verify ownership
    const product = await productService.getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { success: false, error: "Seller not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreById(product.storeId);
    if (!store || store.sellerId !== seller.id) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await productService.updateProduct(productId, validated as any);

    const updatedProduct = await productService.getProductById(productId);

    return NextResponse.json({
      success: true,
      product: updatedProduct,
    });
  } catch (error: any) {
    console.error("Update product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: error.statusCode || 500 }
    );
  }
}

async function deleteHandler(req: NextRequest, context: any, productId: string) {
  try {
    const product = await productService.getProductById(productId);
    if (!product) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      );
    }

    const seller = await authService.getSellerByUserId(context.userId);
    if (!seller) {
      return NextResponse.json(
        { success: false, error: "Seller not found" },
        { status: 404 }
      );
    }

    const store = await storeService.getStoreById(product.storeId);
    if (!store || store.sellerId !== seller.id) {
      if (context.role !== "admin") {
        return NextResponse.json(
          { success: false, error: "Unauthorized" },
          { status: 403 }
        );
      }
    }

    await productService.deleteProduct(productId);

    return NextResponse.json({
      success: true,
    });
  } catch (error: any) {
    console.error("Delete product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: error.statusCode || 500 }
    );
  }
}

export const PUT = withSeller(async (req, context) => {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop() || "";
  return updateHandler(req, context, productId);
});

export const DELETE = withSeller(async (req, context) => {
  const url = new URL(req.url);
  const productId = url.pathname.split("/").pop() || "";
  return deleteHandler(req, context, productId);
});

