"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";

export default function AdminSellersPage() {
  const { token } = useAuth();
  const [sellers, setSellers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSellers();
  }, [token]);

  const fetchSellers = async () => {
    try {
      const response = await fetch("/api/admin/sellers", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSellers(data.sellers || []);
      }
    } catch (error) {
      console.error("Failed to fetch sellers:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">All Sellers</h1>

        {sellers.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No sellers found.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sellers.map((seller) => (
              <Card key={seller.id}>
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{seller.ownerName}</h3>
                  <p className="text-sm text-gray-600 mb-2 capitalize">
                    Type: {seller.businessType}
                  </p>
                  <p className="text-sm capitalize text-gray-500">
                    Status: {seller.verificationStatus}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

