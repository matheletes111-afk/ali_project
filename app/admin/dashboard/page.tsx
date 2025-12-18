"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { formatCurrency } from "@/lib/utils/helpers";

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState({
    totalStores: 0,
    totalSellers: 0,
    totalOrders: 0,
    revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchAnalytics();
    }
  }, [token]);

  const fetchAnalytics = async () => {
    try {
      const response = await fetch("/api/admin/analytics", {
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
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Stores</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalStores}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Sellers</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalSellers}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : stats.totalOrders}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Platform Revenue</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(stats.revenue)}
              </div>
            </div>
          </Card>
        </div>

        <Card title="Quick Actions">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="/admin/stores"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">🏪</div>
              <div className="font-medium">Manage Stores</div>
            </a>
            <a
              href="/admin/sellers"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-medium">Manage Sellers</div>
            </a>
            <a
              href="/admin/plans"
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 text-center"
            >
              <div className="text-2xl mb-2">💳</div>
              <div className="font-medium">Subscription Plans</div>
            </a>
          </div>
        </Card>
      </div>
    </AdminLayout>
  );
}

