import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth/client";

export const metadata: Metadata = {
  title: "Marketplace Platform",
  description: "Multi-store & multi-service marketplace platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
