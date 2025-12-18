"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { LOCATION_TYPES } from "@/lib/utils/constants";

interface ServiceFormData {
  title: string;
  description: string;
  category: string;
  images: File[];
  duration: number;
  basePrice: number;
  locationType: "at_store" | "at_customer" | "remote";
}

export function ServiceForm({ storeId, onSuccess }: { storeId: string; onSuccess?: () => void }) {
  const [formData, setFormData] = useState<ServiceFormData>({
    title: "",
    description: "",
    category: "",
    images: [],
    duration: 60,
    basePrice: 0,
    locationType: "at_store",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const submitData = new FormData();
      submitData.append("storeId", storeId);
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      submitData.append("duration", formData.duration.toString());
      submitData.append("basePrice", (formData.basePrice * 100).toString()); // Convert to cents
      submitData.append("locationType", formData.locationType);

      formData.images.forEach((file, index) => {
        submitData.append(`image_${index}`, file);
      });

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/services", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: submitData,
      });

      const data = await response.json();

      if (response.ok) {
        if (onSuccess) onSuccess();
      } else {
        setError(data.error || "Failed to create service");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Service Title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        />

        <Textarea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
        />

        <Input
          label="Category"
          required
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Duration (minutes)"
            type="number"
            required
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
          />
          <Input
            label="Base Price (₹)"
            type="number"
            step="0.01"
            required
            value={formData.basePrice}
            onChange={(e) => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
          />
        </div>

        <Select
          label="Location Type"
          required
          value={formData.locationType}
          onChange={(e) =>
            setFormData({ ...formData, locationType: e.target.value as any })
          }
          options={[
            { value: LOCATION_TYPES.AT_STORE, label: "At Store" },
            { value: LOCATION_TYPES.AT_CUSTOMER, label: "At Customer Location" },
            { value: LOCATION_TYPES.REMOTE, label: "Remote" },
          ]}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Service Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
          Create Service
        </Button>
      </form>
    </Card>
  );
}

