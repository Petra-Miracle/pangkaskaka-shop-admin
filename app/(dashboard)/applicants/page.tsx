"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useApplicants } from "@/contexts/ApplicantsContext";
import { ApplicantStatus, KaryawanApplication } from "@/lib/types";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/nav/page-header";
import { StatusBadge } from "@/components/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DataTable, legacyCreateColumnHelper } from "@/components/ui/data-table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";

const STATUS_OPTIONS: { value: ApplicantStatus | "all"; label: string }[] = [
  { value: "all", label: "Semua Status" },
  { value: "pending", label: "Menunggu Berkas" },
  { value: "menunggu_tes", label: "Tahap Tes" },
  { value: "seleksi_berkas_lolos", label: "Tahap Tes (Berkas Lolos)" },
  { value: "active", label: "StreetBarber Aktif" },
  { value: "rejected", label: "Ditolak" },
];

function initialsOf(name?: string) {
  return (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function makeColumns(
  shopsById: Record<string, { name: string } | undefined>
): LegacyColumnDef<KaryawanApplication, any>[] {
  const columnHelper = legacyCreateColumnHelper<KaryawanApplication>();

  return [
    columnHelper.accessor("name", {
      header: "Nama",
      cell: ({ row, getValue }) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-primary/10">
            <AvatarFallback className="bg-gradient-to-br from-primary/12 to-primary/5 text-xs font-bold text-primary">
              {initialsOf(getValue() as string)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 leading-tight">
            <p className="max-w-52 truncate font-semibold">{getValue() as string}</p>
            <p className="truncate text-xs text-muted-foreground">
              {row.original.email || "—"}
            </p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor("shop_id", {
      header: "Toko",
      cell: (info) => {
        const shopName = shopsById[info.getValue()]?.name;
        return shopName ? (
          <Badge variant="outline" className="gap-1.5 border-transparent bg-primary/10 font-medium text-primary">
            {shopName}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("status", {
      header: "Status",
      cell: (info) => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("total_score", {
      header: "Skor",
      cell: (info) => {
        const val = info.getValue();
        return val ? (
          <span className="tabular-nums font-semibold">{val}</span>
        ) : (
          <span className="text-muted-foreground">—</span>
        );
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Diajukan",
      cell: (info) => (
        <span className="text-muted-foreground" title={new Date(info.getValue() as string).toLocaleString("id-ID")}>
          {formatRelativeTime(info.getValue() as string)}
        </span>
      ),
    }),
  ];
}

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
      .filter((a) => statusFilter === "all" || a.status === statusFilter);
  }, [applicants, shopFilter, statusFilter]);

  const columns = useMemo(() => makeColumns(shopsById), [shopsById]);

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
          onChange={(e) => setStatusFilter(e.target.value as ApplicantStatus | "all")}
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

      <div className="glass-card rounded-2xl overflow-hidden p-0">
        <DataTable
          columns={columns}
          data={filtered}
          loading={loading}
          initialSorting={[{ id: "created_at", desc: true }]}
          pageSize={10}
          onRowClick={(row) => {
            window.location.href = `/applicants/${row.id}`;
          }}
          emptyState={
            <p className="text-sm text-muted-foreground">
              {applicants.length === 0
                ? "Belum ada pelamar StreetBarber untuk toko yang Anda kelola."
                : "Tidak ada pelamar yang cocok dengan filter saat ini."}
            </p>
          }
        />
      </div>
    </div>
  );
}
