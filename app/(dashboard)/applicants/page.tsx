"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";
import type { Selection } from "@heroui/react";
import { Button, Dropdown, Label } from "@heroui/react";
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
import { Filter } from "lucide-react";

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

  const [shopFilter, setShopFilter] = useState<Selection>(new Set([searchParams.get("shop") || "all"]));
  const [statusFilter, setStatusFilter] = useState<Selection>(new Set(["all"]));

  const managedShopIds = user?.managed_shop_ids || [];

  const selectedShopLabel = useMemo(() => {
    const val = Array.from(shopFilter)[0] as string;
    if (val === "all") return "Semua Toko";
    return shopsById[val]?.name || val;
  }, [shopFilter, shopsById]);

  const selectedStatusLabel = useMemo(() => {
    const val = Array.from(statusFilter)[0] as string;
    return STATUS_OPTIONS.find((o) => o.value === val)?.label || "Semua Status";
  }, [statusFilter]);

  const filtered = useMemo(() => {
    const shopVal = Array.from(shopFilter)[0] as string;
    const statusVal = Array.from(statusFilter)[0] as string;
    return applicants
      .filter((a) => shopVal === "all" || a.shop_id === shopVal)
      .filter((a) => statusVal === "all" || a.status === statusVal);
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
        <Dropdown>
          <Button variant="outline" className="gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
            <Filter className="size-4" />
            {selectedShopLabel}
          </Button>
          <Dropdown.Popover placement="bottom start" className="min-w-[220px]">
            <Dropdown.Menu
              selectionMode="single"
              selectedKeys={shopFilter}
              onSelectionChange={setShopFilter}
            >
              <Dropdown.Item id="all" textValue="Semua Toko">
                <Dropdown.ItemIndicator />
                <Label>Semua Toko</Label>
              </Dropdown.Item>
              {managedShopIds.map((id) => (
                <Dropdown.Item key={id} id={id} textValue={shopsById[id]?.name || id}>
                  <Dropdown.ItemIndicator />
                  <Label>{shopsById[id]?.name || id}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>

        <Dropdown>
          <Button variant="outline" className="gap-2 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20">
            <Filter className="size-4" />
            {selectedStatusLabel}
          </Button>
          <Dropdown.Popover placement="bottom start" className="min-w-[256px]">
            <Dropdown.Menu
              selectionMode="single"
              selectedKeys={statusFilter}
              onSelectionChange={setStatusFilter}
            >
              {STATUS_OPTIONS.map((opt) => (
                <Dropdown.Item key={opt.value} id={opt.value} textValue={opt.label}>
                  <Dropdown.ItemIndicator />
                  <Label>{opt.label}</Label>
                </Dropdown.Item>
              ))}
            </Dropdown.Menu>
          </Dropdown.Popover>
        </Dropdown>
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
