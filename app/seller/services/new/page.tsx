"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { ServiceForm } from "@/components/seller/ServiceForm";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/client";

export default function NewServicePage() {
  const router = useRouter();
  const { token } = useAuth();
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    fetchStoreId();
  }, [token]);

  const fetchStoreId = async () => {
    try {
      const response = await fetch("/api/sellers/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.store?.id) {
          setStoreId(data.store.id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch store:", error);
    }
  };

  if (!storeId) {
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Add New Service</h1>
        <ServiceForm
          storeId={storeId}
          onSuccess={() => router.push("/seller/services")}
        />
      </div>
    </SellerLayout>
  );
}

