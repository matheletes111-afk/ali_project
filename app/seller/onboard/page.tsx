"use client";

import { SellerLayout } from "@/components/seller/SellerLayout";
import { OnboardingWizard } from "@/components/seller/OnboardingWizard";

export default function OnboardPage() {
  return (
    <SellerLayout>
      <div className="py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Complete Your Profile</h1>
        <OnboardingWizard />
      </div>
    </SellerLayout>
  );
}

