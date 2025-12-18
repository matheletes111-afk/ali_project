"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";

export default function StorePage() {
  const { token } = useAuth();
  const [store, setStore] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    contactPhone: "",
    contactEmail: "",
  });

  useEffect(() => {
    fetchStore();
  }, [token]);

  const fetchStore = async () => {
    try {
      const response = await fetch("/api/sellers/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.store) {
          setStore(data.store);
          setFormData({
            name: data.store.name || "",
            description: data.store.description || "",
            contactPhone: data.store.contactPhone || "",
            contactEmail: data.store.contactEmail || "",
          });
        }
      }
    } catch (error) {
      console.error("Failed to fetch store:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!store) return;

    try {
      const response = await fetch(`/api/stores/${store.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        await fetchStore();
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update store:", error);
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

  if (!store) {
    return (
      <SellerLayout>
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">No store found. Please complete onboarding.</p>
            <a href="/seller/onboard">
              <Button variant="primary">Complete Onboarding</Button>
            </a>
          </div>
        </Card>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Store</h1>
          {!isEditing && (
            <Button variant="primary" onClick={() => setIsEditing(true)}>
              Edit Store
            </Button>
          )}
        </div>

        <Card>
          {isEditing ? (
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
              />
              <Input
                label="Contact Phone"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
              <Input
                label="Contact Email"
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
              <div className="flex gap-4">
                <Button variant="primary" onClick={handleSave}>
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Store Name</label>
                <p className="text-lg text-gray-900">{store.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Description</label>
                <p className="text-gray-900">{store.description || "No description"}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900 capitalize">{store.status}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Phone</label>
                <p className="text-gray-900">{store.contactPhone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Contact Email</label>
                <p className="text-gray-900">{store.contactEmail}</p>
              </div>
              {store.address && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Address</label>
                  <p className="text-gray-900">
                    {typeof store.address === "string"
                      ? JSON.parse(store.address).area
                      : store.address.area}
                    , {typeof store.address === "string" ? JSON.parse(store.address).pincode : store.address.pincode}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </SellerLayout>
  );
}

