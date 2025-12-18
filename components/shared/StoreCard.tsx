import React from "react";
import { Card } from "@/components/ui/Card";
import type { Store } from "@/types/entities";
import { formatCurrency } from "@/lib/utils/helpers";

interface StoreCardProps {
  store: Store;
  onClick?: () => void;
}

export const StoreCard: React.FC<StoreCardProps> = ({ store, onClick }) => {
  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex flex-col">
        {store.coverImage && (
          <img
            src={store.coverImage}
            alt={store.name}
            className="w-full h-48 object-cover rounded-t-lg"
          />
        )}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-2">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {store.name}
              </h3>
              {store.isFeatured && (
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                  Featured
                </span>
              )}
            </div>
          </div>
          {store.description && (
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">
              {store.description}
            </p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>{store.category}</span>
            {store.rating && (
              <div className="flex items-center gap-1">
                <span>⭐</span>
                <span>{store.rating.toFixed(1)}</span>
                {store.reviewCount && (
                  <span>({store.reviewCount})</span>
                )}
              </div>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {store.address.area}, {store.address.pincode}
          </div>
        </div>
      </div>
    </Card>
  );
};

