"use client";

import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { formatCurrency } from "@/lib/utils/helpers";

export default function AdminPlansPage() {
  const { token } = useAuth();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, [token]);

  const fetchPlans = async () => {
    try {
      const response = await fetch("/api/admin/subscription-plans", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error("Failed to fetch plans:", error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Subscription Plans</h1>

        {plans.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No plans found.</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <Card key={plan.id}>
                <div className="p-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">
                    {formatCurrency(plan.price)}
                  </p>
                  <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                  <div className="space-y-2 text-sm">
                    <p>Max Products: {plan.maxProducts === -1 ? "Unlimited" : plan.maxProducts}</p>
                    <p>Max Services: {plan.maxServices === -1 ? "Unlimited" : plan.maxServices}</p>
                    <p>Commission: {plan.commissionRate}%</p>
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

