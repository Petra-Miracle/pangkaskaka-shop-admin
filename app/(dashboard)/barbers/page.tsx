"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Barber } from "@/lib/types";
import { getBarbers, deleteBarber } from "@/lib/storage";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable, legacyCreateColumnHelper } from "@/components/ui/data-table";
import type { LegacyColumnDef } from "@tanstack/react-table/legacy";
import { BarberFormDialog } from "./BarberFormDialog";
import { Plus, Pencil, Trash2, Trash, Users } from "lucide-react";

type BarberRow = Barber & {
  _onEdit?: (b: Barber) => void;
  _onDelete?: (id: string) => void;
};

const columnHelper = legacyCreateColumnHelper<BarberRow>();

const columns: LegacyColumnDef<BarberRow, any>[] = [
  columnHelper.accessor("name", {
    header: "Nama",
    cell: ({ row, getValue }) => (
      <div className="flex items-center gap-3">
        {row.original.photo_url ? (
          <img
            src={row.original.photo_url}
            alt={getValue()}
            className="size-9 rounded-full object-cover"
          />
        ) : (
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs text-muted-foreground">
            <Users className="size-4" />
          </div>
        )}
        <div>
          <span className="font-semibold">{getValue()}</span>
          {row.original.email && (
            <p className="text-xs text-muted-foreground">{row.original.email}</p>
          )}
        </div>
      </div>
    ),
  }),
  columnHelper.accessor("phone", {
    header: "No. HP",
    cell: (info) => {
      const val = info.getValue();
      return val ? (
        <span className="tabular-nums">{val}</span>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
    },
  }),
  columnHelper.accessor("specialization", {
    header: "Spesialisasi",
    cell: (info) => {
      const val = info.getValue();
      return val ? (
        <Badge variant="outline">{val}</Badge>
      ) : (
        <span className="text-muted-foreground">-</span>
      );
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
      const barber = row.original;
      return (
        <div className="flex justify-end gap-1">
          <Button
            size="icon"
            variant="ghost"
            className="size-8"
            onClick={(e) => {
              e.stopPropagation();
              barber._onEdit?.(barber);
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
              barber._onDelete?.(barber.id);
            }}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </div>
      );
    },
  }),
];

export default function BarbersPage() {
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBarber, setEditingBarber] = useState<Barber | undefined>();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const fetchBarbers = useCallback(async () => {
    if (!FEATURES.barbers) {
      setBarbers(getBarbers());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ barbers: Barber[] }>("/shop-admin/barbers");
      setBarbers(res.barbers || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setBarbers(getBarbers());
      } else {
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar karyawan."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBarbers();
  }, [fetchBarbers]);

  const addLocal = useCallback((barber: Barber) => {
    setBarbers((prev) => [barber, ...prev]);
  }, []);

  const updateLocal = useCallback((id: string, patch: Partial<Barber>) => {
    setBarbers((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...patch } : b))
    );
  }, []);

  const removeLocal = useCallback((id: string) => {
    setBarbers((prev) => prev.filter((b) => b.id !== id));
  }, []);

  const handleEdit = useCallback((barber: Barber) => {
    setEditingBarber(barber);
    setDialogOpen(true);
  }, []);

  const handleAdd = useCallback(() => {
    setEditingBarber(undefined);
    setDialogOpen(true);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm("Yakin ingin menghapus karyawan ini?")) return;
      try {
        if (!FEATURES.barbers) {
          deleteBarber(id);
          removeLocal(id);
        } else {
          await api.del(`/shop-admin/barbers/${id}`);
          removeLocal(id);
        }
      } catch (err) {
        alert(
          err instanceof ApiError ? err.message : "Gagal menghapus karyawan."
        );
      }
    },
    [removeLocal]
  );

  const handleBulkDelete = useCallback(async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Yakin ingin menghapus ${selectedIds.size} karyawan yang dipilih?`)) return;
    try {
      const ids = Array.from(selectedIds);
      if (!FEATURES.barbers) {
        ids.forEach((id) => deleteBarber(id));
        ids.forEach((id) => removeLocal(id));
      } else {
        const results = await Promise.allSettled(ids.map((id) => api.del(`/shop-admin/barbers/${id}`)));
        ids.forEach((id, i) => {
          if (results[i].status === "fulfilled") removeLocal(id);
        });
      }
      setSelectedIds(new Set());
    } catch (err) {
      alert(err instanceof ApiError ? err.message : "Gagal menghapus karyawan.");
    }
  }, [selectedIds, removeLocal]);

  const enrichedData = useMemo(
    (): BarberRow[] =>
      barbers.map((b) => ({
        ...b,
        _onEdit: handleEdit,
        _onDelete: handleDelete,
      })),
    [barbers, handleEdit, handleDelete]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Manajemen"
        title="Karyawan / Barber"
        description="Kelola daftar karyawan atau barber yang bekerja di toko Anda."
        actions={
          <Button onClick={handleAdd} size="sm">
            <Plus className="mr-1.5 size-4" />
            Tambah Karyawan
          </Button>
        }
      />

      {error && (
        <div className="rounded-md bg-muted px-4 py-3 text-sm font-medium text-muted-foreground">
          {error}
          <Button
            variant="link"
            className="ml-2 h-auto p-0 underline"
            onClick={fetchBarbers}
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
                {selectedIds.size} karyawan dipilih
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
              {error ? "Belum ada data." : "Belum ada karyawan."}
            </p>
          }
        />
      </div>

      <BarberFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditingBarber(undefined);
        }}
        barber={editingBarber}
        onCreated={addLocal}
        onUpdated={updateLocal}
      />
    </div>
  );
}
