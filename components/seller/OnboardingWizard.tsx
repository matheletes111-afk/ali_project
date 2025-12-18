"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/lib/auth/client";
import { BUSINESS_TYPES } from "@/lib/utils/constants";

interface OnboardingData {
  ownerName: string;
  businessType: "shop" | "service";
  shopName: string;
  category: string;
  contactPhone: string;
  contactEmail: string;
  address: {
    area: string;
    pincode: string;
    ward?: string;
    landmark?: string;
  };
  description?: string;
  documents: File[];
}

const STEPS = [
  { id: 1, title: "Business Type" },
  { id: 2, title: "Basic Info" },
  { id: 3, title: "Address" },
  { id: 4, title: "Documents" },
  { id: 5, title: "Subscription" },
];

export function OnboardingWizard() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<OnboardingData>>({
    businessType: "shop",
    address: {
      area: "",
      pincode: "",
      ward: "",
      landmark: "",
    },
    documents: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const { token } = useAuth();

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    try {
      // Convert files to document format expected by API
      // Note: In production, files should be uploaded to Instant DB storage first
      const documents = await Promise.all(
        (formData.documents || []).map(async (file) => {
          // For now, convert to data URL (in production, upload to Instant DB storage)
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          return {
            type: "registration_certificate",
            fileUrl: dataUrl, // In production, this should be the Instant DB storage URL
            fileName: file.name,
            fileSize: file.size,
            mimeType: file.type,
          };
        })
      );

      if (documents.length === 0) {
        setError("Please upload at least one document");
        setIsLoading(false);
        return;
      }

      const requestBody = {
        ownerName: formData.ownerName || "",
        businessType: formData.businessType || "shop",
        address: formData.address,
        category: formData.category || "",
        contactPhone: formData.contactPhone || "",
        contactEmail: formData.contactEmail || "",
        documents,
      };

      const response = await fetch("/api/sellers/onboard", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        router.push("/seller/dashboard");
      } else {
        setError(data.error || data.message || "Onboarding failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({
        ...formData,
        documents: Array.from(e.target.files),
      });
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">What type of business do you run?</h3>
            <Select
              label="Business Type"
              required
              value={formData.businessType}
              onChange={(e) =>
                setFormData({ ...formData, businessType: e.target.value as "shop" | "service" })
              }
              options={[
                { value: BUSINESS_TYPES.SHOP, label: "Shop (Sell Products)" },
                { value: BUSINESS_TYPES.SERVICE, label: "Service Business" },
              ]}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Basic Information</h3>
            <Input
              label="Owner Name"
              required
              value={formData.ownerName || ""}
              onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
            />
            <Input
              label="Business Name"
              required
              value={formData.shopName || ""}
              onChange={(e) => setFormData({ ...formData, shopName: e.target.value })}
            />
            <Input
              label="Category"
              required
              value={formData.category || ""}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              placeholder="e.g., Electronics, Food, Beauty, etc."
            />
            <Input
              label="Contact Phone"
              type="tel"
              required
              value={formData.contactPhone || ""}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
            />
            <Input
              label="Contact Email"
              type="email"
              required
              value={formData.contactEmail || ""}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
            />
            <Textarea
              label="Description (optional)"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Store Address</h3>
            <Input
              label="Area"
              required
              value={formData.address?.area || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, area: e.target.value },
                })
              }
            />
            <Input
              label="Pincode"
              required
              value={formData.address?.pincode || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, pincode: e.target.value },
                })
              }
            />
            <Input
              label="Ward (optional)"
              value={formData.address?.ward || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, ward: e.target.value },
                })
              }
            />
            <Input
              label="Landmark (optional)"
              value={formData.address?.landmark || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  address: { ...formData.address!, landmark: e.target.value },
                })
              }
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Upload Documents</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Registration Certificate *
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="mt-1 text-sm text-gray-500">
                Upload registration certificate or business license (PDF, JPG, PNG - max 5MB)
              </p>
              {formData.documents && formData.documents.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    {formData.documents.length} file(s) selected
                  </p>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Review & Complete</h3>
            <p className="text-gray-600">
              Review your information and complete onboarding. You can select a subscription plan after your store is approved.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> Your store will be reviewed by our admin team. You'll be notified once it's approved. 
                You can then select a subscription plan from the settings page.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex-1">
                <div className="flex items-center">
                  <div
                    className={`flex-1 h-2 rounded ${
                      step.id <= currentStep ? "bg-blue-600" : "bg-gray-200"
                    }`}
                  />
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-2 h-2 rounded-full ${
                        step.id < currentStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
                <div className="mt-2 text-center">
                  <div
                    className={`text-xs font-medium ${
                      step.id <= currentStep ? "text-blue-600" : "text-gray-500"
                    }`}
                  >
                    {step.title}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">{renderStep()}</div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md">{error}</div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" onClick={handleBack} disabled={currentStep === 1}>
            Back
          </Button>
          {currentStep < STEPS.length ? (
            <Button variant="primary" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button variant="primary" onClick={handleSubmit} isLoading={isLoading}>
              Complete Onboarding
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}

