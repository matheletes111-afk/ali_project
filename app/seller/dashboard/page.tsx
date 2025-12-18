"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { formatCurrency } from "@/lib/utils/helpers";

export default function SellerDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    orders: 0,
    revenue: 0,
    products: 0,
    services: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      checkOnboarding();
    }
  }, [token]);

  const checkOnboarding = async () => {
    try {
      const response = await fetch("/api/sellers/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        // If seller has no store, redirect to onboarding
        if (!data.store) {
          window.location.href = "/seller/onboard";
          return;
        }
        fetchAnalytics();
      }
    } catch (error) {
      console.error("Failed to check onboarding:", error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/sellers/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SellerLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.orders}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Revenue</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(stats.revenue)}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Products</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.products}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Services</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.services}
              </div>
            </div>
          </Card>
        </div>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/seller/products/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="font-medium">Add Product</div>
            </a>
            <a
              href="/seller/services/new"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">🔧</div>
              <div className="font-medium">Add Service</div>
            </a>
            <a
              href="/seller/store"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">🏪</div>
              <div className="font-medium">Manage Store</div>
            </a>
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}

