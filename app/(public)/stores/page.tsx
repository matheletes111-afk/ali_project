"use client";

import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { StoreCard } from "@/components/shared/StoreCard";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StoresPage() {
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: "",
    pincode: "",
    area: "",
    ward: "",
  });

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.category) params.append("category", filters.category);
      if (filters.pincode) params.append("pincode", filters.pincode);
      if (filters.area) params.append("area", filters.area);
      if (filters.ward) params.append("ward", filters.ward);

      const response = await fetch(`/api/stores/search?${params.toString()}`);

      if (response.ok) {
        const data = await response.json();
        setStores(data.stores || []);
      }
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setLoading(true);
    fetchStores();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Marketplace
            </Link>
            <div className="flex gap-4">
              <Link href="/login">
                <Button variant="outline">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button variant="primary">Sign Up</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Browse Stores</h1>

        <Card className="mb-8">
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Category"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                placeholder="e.g., Electronics"
              />
              <Input
                label="Pincode"
                value={filters.pincode}
                onChange={(e) => setFilters({ ...filters, pincode: e.target.value })}
                placeholder="123456"
              />
              <Input
                label="Area"
                value={filters.area}
                onChange={(e) => setFilters({ ...filters, area: e.target.value })}
                placeholder="Area name"
              />
              <Input
                label="Ward"
                value={filters.ward}
                onChange={(e) => setFilters({ ...filters, ward: e.target.value })}
                placeholder="Ward number"
              />
            </div>
            <div className="mt-4">
              <Button variant="primary" onClick={handleSearch}>
                Search Stores
              </Button>
            </div>
          </div>
        </Card>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : stores.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No stores found.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores.map((store) => (
              <Link key={store.id} href={`/stores/${store.id}`}>
                <StoreCard store={store} />
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

