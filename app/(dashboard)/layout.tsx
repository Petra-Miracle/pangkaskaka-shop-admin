"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { ApplicantsProvider } from "@/contexts/ApplicantsContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { ServicesProvider } from "@/contexts/ServicesContext";
import { Sidebar } from "@/components/nav/sidebar";
import { Topbar } from "@/components/nav/topbar";
import { MobileNav } from "@/components/nav/mobile-nav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <ApplicantsProvider>
      <ProductsProvider>
        <ServicesProvider>
          <div className="bg-gradient-mesh relative flex min-h-screen">
            <Sidebar />
            <div className="flex min-w-0 flex-1 flex-col">
              <Topbar />
              <MobileNav />
              <main className="w-full flex-1 overflow-y-auto p-4 pb-28 md:p-6 md:pb-6">
                <div className="mx-auto w-full max-w-[1440px]">{children}</div>
              </main>
            </div>
          </div>
        </ServicesProvider>
      </ProductsProvider>
    </ApplicantsProvider>
  );
}
