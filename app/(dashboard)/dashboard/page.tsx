"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import Card from "@/components/ui/Card";
import { ApplicantStatus } from "@/lib/types";

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

  const managedShopIds = user?.managed_shop_ids || [];

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-gradient-to-br from-[#0A2540] via-[#0F2E4F] to-[#1B4A7A] p-7 text-white">
        <p className="text-sm font-medium text-white/70">Selamat datang,</p>
        <h1 className="mt-1 text-2xl font-extrabold">{user?.name}</h1>
        <p className="mt-2 text-sm text-white/70">
          Anda mengelola validasi StreetBarber untuk {managedShopIds.length}{" "}
          toko.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      )}

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">
          Ringkasan Pelamar
        </h2>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {SUMMARY_STATUSES.map((group) => {
            const count = applicants.filter((a) =>
              group.status.includes(a.status)
            ).length;
            return (
              <Card key={group.label}>
                <p className="text-3xl font-extrabold" style={{ color: group.color }}>
                  {loading ? "-" : count}
                </p>
                <p className="mt-1 text-sm font-medium text-text-dim">
                  {group.label}
                </p>
              </Card>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">
          Toko yang Anda Kelola
        </h2>

        {managedShopIds.length === 0 ? (
          <Card className="text-center">
            <p className="font-semibold text-text">
              Belum ada toko yang di-assign ke akun Anda.
            </p>
            <p className="mt-1 text-sm text-text-dim">
              Hubungi SuperAdmin untuk menugaskan toko ke akun Admin ini
              sebelum Anda dapat memvalidasi pelamar StreetBarber.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {managedShopIds.map((shopId) => {
              const shop = shopsById[shopId];
              const shopApplicants = applicants.filter(
                (a) => a.shop_id === shopId
              );
              return (
                <Link key={shopId} href={`/applicants?shop=${shopId}`}>
                  <Card className="h-full transition hover:border-brand hover:shadow-md">
                    <p className="font-bold text-text">
                      {shop?.name || "Memuat nama toko..."}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-dim">
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
                            className="rounded-sm px-2 py-1"
                            style={{
                              backgroundColor: "var(--color-surface-2)",
                              color: group.color,
                            }}
                          >
                            {count} {group.label}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
