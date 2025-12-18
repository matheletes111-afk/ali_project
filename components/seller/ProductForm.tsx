"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";

interface ProductVariant {
  sku: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  attributes?: Record<string, string>;
}

interface ProductFormData {
  title: string;
  description: string;
  category: string;
  images: File[];
  variants: ProductVariant[];
}

export function ProductForm({ storeId, onSuccess }: { storeId: string; onSuccess?: () => void }) {
  const [formData, setFormData] = useState<ProductFormData>({
    title: "",
    description: "",
    category: "",
    images: [],
    variants: [{ sku: "", name: "Default", price: 0, stock: 0 }],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, images: Array.from(e.target.files) });
    }
  };

  const handleVariantChange = (index: number, field: keyof ProductVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { sku: "", name: "", price: 0, stock: 0 },
      ],
    });
  };

  const removeVariant = (index: number) => {
    if (formData.variants.length > 1) {
      const newVariants = formData.variants.filter((_, i) => i !== index);
      setFormData({ ...formData, variants: newVariants });
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
      submitData.append("variants", JSON.stringify(formData.variants));

      formData.images.forEach((file, index) => {
        submitData.append(`image_${index}`, file);
      });

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/products", {
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
        setError(data.error || "Failed to create product");
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
          label="Product Title"
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Product Images
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Variants</h3>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {formData.variants.map((variant, index) => (
              <Card key={index}>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="SKU"
                    value={variant.sku}
                    onChange={(e) =>
                      handleVariantChange(index, "sku", e.target.value)
                    }
                  />
                  <Input
                    label="Variant Name"
                    value={variant.name}
                    onChange={(e) =>
                      handleVariantChange(index, "name", e.target.value)
                    }
                  />
                  <Input
                    label="Price (₹)"
                    type="number"
                    step="0.01"
                    value={variant.price / 100}
                    onChange={(e) =>
                      handleVariantChange(index, "price", Math.round(parseFloat(e.target.value) * 100))
                    }
                  />
                  <Input
                    label="Stock"
                    type="number"
                    value={variant.stock}
                    onChange={(e) =>
                      handleVariantChange(index, "stock", parseInt(e.target.value))
                    }
                  />
                  {formData.variants.length > 1 && (
                    <div className="col-span-2">
                      <Button
                        type="button"
                        variant="danger"
                        size="sm"
                        onClick={() => removeVariant(index)}
                      >
                        Remove Variant
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
        )}

        <Button type="submit" variant="primary" size="lg" isLoading={isLoading}>
          Create Product
        </Button>
      </form>
    </Card>
  );
}

