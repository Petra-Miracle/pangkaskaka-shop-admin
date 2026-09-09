"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import { useProducts } from "@/contexts/ProductsContext";
import { useServices } from "@/contexts/ServicesContext";
import { PageHeader } from "@/components/nav/page-header";
import { ApplicantStatus } from "@/lib/types";
import { Package, Scissors, TrendingUp } from "lucide-react";

const SUMMARY_STATUSES: { status: ApplicantStatus[]; label: string; color: string }[] = [
  { status: ["pending"], label: "Menunggu Berkas", color: "var(--color-warning)" },
  {
    status: ["menunggu_tes", "seleksi_berkas_lolos"],
    label: "Tahap Tes",
    color: "var(--color-info)",
  },
  { status: ["active"], label: "StreetBarber Aktif", color: "var(--color-success)" },
  { status: ["rejected"], label: "Ditolak", color: "var(--color-error)" },
];

export default function DashboardPage() {
  const { user, shopsById } = useAuth();
  const { applicants, loading, error } = useApplicants();
  const { products } = useProducts();
  const { services } = useServices();

  const managedShopIds = user?.managed_shop_ids || [];

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Ringkasan"
        title="Dashboard"
        description={`Anda mengelola validasi StreetBarber untuk ${managedShopIds.length} toko.`}
      />

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="stagger-children grid grid-cols-2 gap-3 sm:grid-cols-4">
        {SUMMARY_STATUSES.map((group) => {
          const count = applicants.filter((a) =>
            group.status.includes(a.status)
          ).length;
          return (
            <div key={group.label} className="glass-card card-glow rounded-2xl p-4">
              <p className="text-3xl font-extrabold" style={{ color: group.color }}>
                {loading ? "-" : count}
              </p>
              <p className="mt-1 text-sm font-medium text-muted-foreground">
                {group.label}
              </p>
            </div>
          );
        })}
      </div>

      <div className="stagger-children grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link href="/products">
          <div className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <Package className="size-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-primary">
                {products.length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Produk</p>
            </div>
          </div>
        </Link>
        <Link href="/services">
          <div className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-info/10 p-2">
              <Scissors className="size-5 text-info" />
            </div>
            <div>
              <p className="text-2xl font-extrabold text-info">
                {services.length}
              </p>
              <p className="text-sm font-medium text-muted-foreground">Layanan</p>
            </div>
          </div>
        </Link>
        <Link href="/revenue">
          <div className="glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-3">
            <div className="rounded-lg bg-success/10 p-2">
              <TrendingUp className="size-5 text-success" />
            </div>
            <div>
              <p className="text-sm font-extrabold text-success">Revenue</p>
              <p className="text-sm font-medium text-muted-foreground">Lihat laporan keuangan</p>
            </div>
          </div>
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
          Toko yang Anda Kelola
        </h2>

        {managedShopIds.length === 0 ? (
          <div className="glass-card rounded-2xl p-6 text-center">
            <p className="font-semibold text-foreground">
              Belum ada toko yang di-assign ke akun Anda.
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Hubungi SuperAdmin untuk menugaskan toko ke akun Admin ini
              sebelum Anda dapat memvalidasi pelamar StreetBarber.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {managedShopIds.map((shopId) => {
              const shop = shopsById[shopId];
              const shopApplicants = applicants.filter(
                (a) => a.shop_id === shopId
              );
              return (
                <Link key={shopId} href={`/applicants?shop=${shopId}`}>
                  <div className="glass-card glass-card-hover rounded-2xl p-5 h-full">
                    <p className="font-bold text-foreground">
                      {shop?.name || "Memuat nama toko..."}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {shop?.address || shopId}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                      {SUMMARY_STATUSES.map((group) => {
                        const count = shopApplicants.filter((a) =>
                          group.status.includes(a.status)
                        ).length;
                        return (
                          <span
                            key={group.label}
                            className="rounded-full px-2 py-1"
                            style={{
                              backgroundColor: "var(--color-muted)",
                              color: group.color,
                            }}
                          >
                            {count} {group.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
