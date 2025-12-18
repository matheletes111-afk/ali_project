"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";

export default function AdminStoresPage() {
  const { token } = useAuth();
  const [stores, setStores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingStores();
  }, [token]);

  const fetchPendingStores = async () => {
    try {
      const response = await fetch("/api/admin/stores/pending", {
        headers: { Authorization: `Bearer ${token}` },
      });

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

  const handleApprove = async (storeId: string, approved: boolean) => {
    try {
      const response = await fetch(`/api/admin/stores/${storeId}/approve`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ approved }),
      });

      if (response.ok) {
        fetchPendingStores();
      }
    } catch (error) {
      console.error("Failed to update store:", error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Pending Stores</h1>

        {stores.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No pending stores.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {stores.map((store) => (
              <Card key={store.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">{store.name}</h3>
                      <p className="text-sm text-gray-600">{store.category}</p>
                      <p className="text-sm text-gray-500 capitalize">Status: {store.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleApprove(store.id, true)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleApprove(store.id, false)}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Contact: {store.contactPhone} | {store.contactEmail}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

