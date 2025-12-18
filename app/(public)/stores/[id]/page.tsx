"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function StoreDetailPage() {
  const params = useParams();
  const storeId = params.id as string;
  const [store, setStore] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreDetails();
  }, [storeId]);

  const fetchStoreDetails = async () => {
    try {
      const response = await fetch(`/api/stores/${storeId}`);
      if (response.ok) {
        const data = await response.json();
        setStore(data.store);
        setProducts(data.products || []);
        setServices(data.services || []);
      }
    } catch (error) {
      console.error("Failed to fetch store:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Store not found</h1>
          <Link href="/stores">
            <Button variant="primary">Back to Stores</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/stores" className="text-blue-600 hover:text-blue-700">
            ← Back to Stores
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="mb-8">
          <div className="p-6">
            <div className="flex items-start gap-6">
              {store.logo && (
                <img
                  src={store.logo}
                  alt={store.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{store.name}</h1>
                {store.description && (
                  <p className="text-gray-600 mb-4">{store.description}</p>
                )}
                <div className="flex gap-4 text-sm text-gray-600">
                  <span>Category: {store.category}</span>
                  {store.rating && (
                    <span>Rating: ⭐ {store.rating.toFixed(1)}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {products.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card key={product.id}>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{product.title}</h3>
                    <p className="text-sm text-gray-600">{product.description}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {services.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Services</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <Card key={service.id}>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      Duration: {service.duration} minutes
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

