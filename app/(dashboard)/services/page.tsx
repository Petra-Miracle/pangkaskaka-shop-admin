"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Service } from "@/lib/types";
import { getServices, deleteService } from "@/lib/storage";
import { formatRupiah } from "@/lib/utils";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, legacyCreateColumnHelper } from "@/components/ui/data-table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { ServiceFormDialog } from "./ServiceFormDialog";
import { Plus, Pencil, Trash2, Trash } from "lucide-react";

type ServiceRow = Service & { _onEdit?: (s: Service) => void; _onDelete?: (id: string) => void };

const columnHelper = legacyCreateColumnHelper<ServiceRow>();

const columns: LegacyColumnDef<ServiceRow, any>[] = [
  columnHelper.accessor("name", {
    header: "Nama",
    cell: (info) => <span className="font-semibold">{info.getValue()}</span>,
  }),
  columnHelper.accessor("description", {
    header: "Deskripsi",
    cell: (info) => (
      <span className="max-w-[200px] truncate text-muted-foreground">
        {info.getValue() || "-"}
      </span>
    ),
  }),
  columnHelper.accessor("price", {
    header: "Harga",
    cell: (info) => (
      <span className="tabular-nums">{formatRupiah(info.getValue())}</span>
    ),
  }),
  columnHelper.accessor("duration_minutes", {
    header: "Durasi",
    cell: (info) => {
      const val = info.getValue();
      return val ? `${val} menit` : "-";
    },
  }),
  columnHelper.accessor("is_active", {
    header: "Status",
    cell: (info) =>
      info.getValue() ? (
        <Badge className="bg-success/15 text-success">Aktif</Badge>
      ) : (
        <Badge variant="secondary">Nonaktif</Badge>
      ),
  }),
  columnHelper.display({
    id: "actions",
    header: () => <span className="sr-only">Aksi</span>,
    cell: ({ row }) => {
      const svc = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              svc._onEdit?.(svc);
            }}
          >
            <Pencil className="size-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              svc._onDelete?.(svc.id);
            }}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      );
    },
  }),
];

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchServices = useCallback(async () => {
    if (!FEATURES.services) {
      setServices(getServices());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ services: Service[] }>("/shop-admin/services");
      setServices(res.services || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setServices(getServices());
      } else {
        setError(err instanceof Error ? err.message : "Gagal memuat daftar layanan.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const addLocal = useCallback((service: Service) => {
    setServices((prev) => [service, ...prev]);
  }, []);

  const updateLocal = useCallback((id: string, patch: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }, []);

  const removeLocal = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleEdit = useCallback((svc: Service) => {
    setEditingService(svc);
    setDialogOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingService(undefined);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return;
    try {
      if (!FEATURES.services) {
        deleteService(id);
        removeLocal(id);
      } else {
        await api.del(`/shop-admin/services/${id}`);
        removeLocal(id);
      }
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus layanan.");
    }
  }, [removeLocal]);

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.size} layanan yang dipilih?`)) return;
    try {
      const ids = Array.from(selectedIds);
      if (!FEATURES.services) {
        ids.forEach((id) => deleteService(id));
        ids.forEach((id) => removeLocal(id));
      } else {
        await Promise.all(ids.map((id) => api.del(`/shop-admin/services/${id}`)));
        ids.forEach((id) => removeLocal(id));
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus layanan.");
    }
  }, [selectedIds, removeLocal]);

  const enrichedData = useMemo(
    (): ServiceRow[] =>
      services.map((s) => ({
        ...s,
        _onEdit: handleEdit,
        _onDelete: handleDelete,
      })),
    [services, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Usaha"
        title="Layanan"
        description="Kelola layanan yang ditawarkan di toko Anda."
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1.5 size-4" />
            Tambah Layanan
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
          {error}
          <Button
            variant="link"
            className="ml-2 h-auto p-0 underline"
            onClick={fetchServices}
          >
            Coba lagi
          </Button>
        </div>
      )}

      <div className="glass-card rounded-2xl overflow-hidden p-0">
        <DataTable
          columns={columns}
          data={enrichedData}
          loading={loading}
          initialSorting={[{ id: "name", desc: false }]}
          pageSize={10}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          getRowId={(row) => row.id}
          selectionBar={
            <div className="flex items-center justify-between border-b border-border bg-primary/5 px-4 py-2">
              <span className="text-sm font-medium text-primary">
                {selectedIds.size} layanan dipilih
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
              >
                <Trash className="mr-1.5 size-4" />
                Hapus Terpilih
              </Button>
            </div>
          }
          emptyState={
            <p className="text-sm text-muted-foreground">
              {error ? "Belum ada data." : "Belum ada layanan."}
            </p>
          }
        />
      </div>

      <ServiceFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingService(undefined);
        }}
        service={editingService}
        onCreated={addLocal}
        onUpdated={updateLocal}
      />
    </div>
  );
}
