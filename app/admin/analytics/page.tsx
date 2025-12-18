"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { formatCurrency } from "@/lib/utils/helpers";

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [analytics, setAnalytics] = useState<any>({});
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
        setAnalytics(data);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Platform Analytics</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Stores</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : analytics.totalStores || 0}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Sellers</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : analytics.totalSellers || 0}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Total Orders</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : analytics.totalOrders || 0}
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-6">
              <div className="text-sm font-medium text-gray-500">Platform Revenue</div>
              <div className="mt-2 text-3xl font-bold text-gray-900">
                {loading ? "..." : formatCurrency(analytics.revenue || 0)}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

