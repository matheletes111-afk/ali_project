"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import { formatCurrency } from "@/lib/utils/helpers";

export default function OrdersPage() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/orders/seller", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders</h1>

        {orders.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600">No orders yet.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Order #{order.orderNumber}</h3>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(order.total)}</p>
                      <span className={`inline-block px-2 py-1 text-xs rounded capitalize ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                  <div className="border-t pt-4">
                    <p className="text-sm text-gray-600">
                      Type: {order.type} | Items: {order.items?.length || 0}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SellerLayout>
  );
}

