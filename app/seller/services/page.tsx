"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";
import Link from "next/link";

export default function ServicesPage() {
  const { token } = useAuth();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreAndServices();
  }, [token]);

  const fetchStoreAndServices = async () => {
    try {
      const profileResponse = await fetch("/api/sellers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        if (profileData.store?.id) {
          setStoreId(profileData.store.id);

          const servicesResponse = await fetch(`/api/services/store/${profileData.store.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            setServices(servicesData.services || []);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          {storeId && (
            <Link href="/seller/services/new">
              <Button variant="primary">Add Service</Button>
            </Link>
          )}
        </div>

        {services.length === 0 ? (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">No services yet. Add your first service!</p>
              {storeId && (
                <Link href="/seller/services/new">
                  <Button variant="primary">Add Service</Button>
                </Link>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <Card key={service.id}>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{service.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{service.category}</p>
                  <p className="text-sm capitalize text-gray-500">Status: {service.status}</p>
                  <div className="mt-4">
                    <Link href={`/seller/services/${service.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
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

