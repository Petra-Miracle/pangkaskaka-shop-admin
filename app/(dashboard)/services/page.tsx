"use client";

import { useCallback, useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Service } from "@/lib/types";
import { getServices, deleteService } from "@/lib/storage";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceFormDialog } from "./ServiceFormDialog";
import { Plus, Pencil, Trash2 } from "lucide-react";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    if (!FEATURES.services) {
      setServices(getServices());
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ services: Service[] }>(
        "/shop-admin/services"
      );
      setServices(res.services || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur layanan belum tersedia di server.");
      } else {
        setError(
          err instanceof Error ? err.message : "Gagal memuat daftar layanan."
        );
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
    setServices((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  }, []);

  const removeLocal = useCallback((id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const handleEdit = (svc: Service) => {
    setEditingService(svc);
    setDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingService(undefined);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus layanan ini?")) return;
    setDeleting(id);
    try {
      if (!FEATURES.services) {
        deleteService(id);
        removeLocal(id);
      } else {
        await api.del(`/shop-admin/services/${id}`);
        removeLocal(id);
      }
    } catch (err) {
      alert(
        err instanceof ApiError ? err.message : "Gagal menghapus layanan."
      );
    } finally {
      setDeleting(null);
    }
  };

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

      <div className="glass-card rounded-2xl">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        ) : services.length === 0 ? (
          <div className="p-12 text-center">
            <p className="font-semibold text-foreground">
              {error ? "Belum ada data." : "Belum ada layanan."}
            </p>
            {!error && (
              <p className="mt-1 text-sm text-muted-foreground">
                Klik &quot;Tambah Layanan&quot; untuk mulai menambahkan layanan.
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="text-right">Harga</TableHead>
                <TableHead className="text-right">Durasi</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((svc) => (
                <TableRow key={svc.id}>
                  <TableCell className="font-medium">{svc.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate text-muted-foreground">
                    {svc.description || "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatRupiah(svc.price)}
                  </TableCell>
                  <TableCell className="text-right">
                    {svc.duration_minutes
                      ? `${svc.duration_minutes} menit`
                      : "-"}
                  </TableCell>
                  <TableCell>
                    {svc.is_active ? (
                      <Badge className="bg-success/15 text-success">
                        Aktif
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Nonaktif</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleEdit(svc)}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDelete(svc.id)}
                        disabled={deleting === svc.id}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
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
