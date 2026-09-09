"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import { PageHeader } from "@/components/nav/page-header";
import { StatusBadge } from "@/components/StatusBadge";
import { ApplicantStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
      <PageHeader
        eyebrow="Manajemen"
        title="Pelamar StreetBarber"
        description="Daftar pelamar dari semua toko yang Anda kelola."
      />

      <div className="flex flex-wrap gap-3">
        <select
          value={shopFilter}
          onChange={(e) => setShopFilter(e.target.value)}
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
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
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium text-foreground outline-none focus:border-primary"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 px-4 py-3 text-sm font-medium text-destructive">
          {error}
        </div>
      )}

      <div className="glass-card rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-foreground">Tidak ada pelamar.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {applicants.length === 0
                ? "Belum ada pelamar StreetBarber untuk toko yang Anda kelola."
                : "Tidak ada pelamar yang cocok dengan filter saat ini."}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Toko</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Tanggal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Skor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-semibold">
                    <Link href={`/applicants/${a.id}`} className="hover:underline">
                      {a.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {shopsById[a.shop_id]?.name || a.shop_id}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {a.email}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(a.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={a.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {a.evaluated_at ? a.total_score : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
