"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import Card from "@/components/ui/Card";
import StatusBadge from "@/components/StatusBadge";
import { ApplicantStatus } from "@/lib/types";

const STATUS_OPTIONS: { value: ApplicantStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Berkas" },
  { value: "menunggu_tes", label: "Tahap Tes" },
  { value: "seleksi_berkas_lolos", label: "Tahap Tes (Berkas Lolos)" },
  { value: "active", label: "StreetBarber Aktif" },
  { value: "rejected", label: "Ditolak" },
];

export default function ApplicantsPage() {
  return (
    <Suspense fallback={null}>
      <ApplicantsPageInner />
    </Suspense>
  );
}

function ApplicantsPageInner() {
  const searchParams = useSearchParams();
  const { user, shopsById } = useAuth();
  const { applicants, loading, error } = useApplicants();

  const [shopFilter, setShopFilter] = useState(searchParams.get("shop") || "all");
  const [statusFilter, setStatusFilter] = useState<ApplicantStatus | "all">("all");

  const managedShopIds = user?.managed_shop_ids || [];

  const filtered = useMemo(() => {
    return applicants
      .filter((a) => shopFilter === "all" || a.shop_id === shopFilter)
      .filter((a) => statusFilter === "all" || a.status === statusFilter)
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
  }, [applicants, shopFilter, statusFilter]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-text">
          Pelamar StreetBarber
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Daftar pelamar dari semua toko yang Anda kelola.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <select
          value={shopFilter}
          onChange={(e) => setShopFilter(e.target.value)}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text outline-none focus:border-brand"
        >
          <option value="all">Semua Toko</option>
          {managedShopIds.map((id) => (
            <option key={id} value={id}>
              {shopsById[id]?.name || id}
            </option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as ApplicantStatus | "all")
          }
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm font-medium text-text outline-none focus:border-brand"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-[#FEF2F2] px-4 py-3 text-sm font-medium text-error">
          {error}
        </div>
      )}

      {loading ? (
        <Card className="text-center text-sm text-text-dim">Memuat...</Card>
      ) : filtered.length === 0 ? (
        <Card className="text-center">
          <p className="font-semibold text-text">Tidak ada pelamar.</p>
          <p className="mt-1 text-sm text-text-dim">
            {applicants.length === 0
              ? "Belum ada pelamar StreetBarber untuk toko yang Anda kelola."
              : "Tidak ada pelamar yang cocok dengan filter saat ini."}
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <Link key={a.id} href={`/applicants/${a.id}`}>
              <Card className="flex items-center justify-between gap-4 transition hover:border-brand hover:shadow-md">
                <div className="min-w-0">
                  <p className="truncate font-bold text-text">{a.name}</p>
                  <p className="truncate text-xs text-text-dim">
                    {shopsById[a.shop_id]?.name || a.shop_id} &middot;{" "}
                    {a.email}
                  </p>
                  <p className="mt-1 text-xs text-text-dim">
                    Diajukan{" "}
                    {new Date(a.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={a.status} />
                  {a.evaluated_at && (
                    <span className="text-xs font-semibold text-text-dim">
                      Skor: {a.total_score}
                    </span>
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
