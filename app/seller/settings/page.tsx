"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";

export default function SettingsPage() {
  const { token } = useAuth();
  const [seller, setSeller] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/sellers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setSeller(data.seller);
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>

        <Card title="Subscription">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Current Plan</label>
              <p className="text-lg text-gray-900">
                {seller?.subscriptionPlanId || "Not selected"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-lg capitalize text-gray-900">
                {seller?.subscriptionStatus || "N/A"}
              </p>
            </div>
            <Button variant="primary">Manage Subscription</Button>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}

