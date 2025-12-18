"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import Link from "next/link";

export default function ProductsPage() {
  const { token } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreAndProducts();
  }, [token]);

  const fetchStoreAndProducts = async () => {
    try {
      // First get store ID
      const profileResponse = await fetch("/api/sellers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.store?.id) {
          setStoreId(profileData.store.id);

          // Then fetch products
          const productsResponse = await fetch(`/api/products/store/${profileData.store.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (productsResponse.ok) {
            const productsData = await productsResponse.json();
            setProducts(productsData.products || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          {storeId && (
            <Link href="/seller/products/new">
              <Button variant="primary">Add Product</Button>
            </Link>
          )}
        </div>

        {products.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No products yet. Add your first product!</p>
              {storeId && (
                <Link href="/seller/products/new">
                  <Button variant="primary">Add Product</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <Card key={product.id}>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{product.category}</p>
                  <p className="text-sm capitalize text-gray-500">Status: {product.status}</p>
                  <div className="mt-4">
                    <Link href={`/seller/products/${product.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

