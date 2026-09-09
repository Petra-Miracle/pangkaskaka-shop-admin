"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { Service, ServiceFormData } from "@/lib/types";
import { FEATURES } from "@/lib/features";
import { createService, updateService } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface ServiceFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service?: Service;
  onCreated?: (service: Service) => void;
  onUpdated?: (id: string, patch: Partial<Service>) => void;
}

function formatRupiahInput(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function parseRupiahInput(formatted: string): number {
  return Number(formatted.replace(/\./g, ""));
}

export function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onCreated,
  onUpdated,
}: ServiceFormDialogProps) {
  const { user, shopsById } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<ServiceFormData>({
    name: service?.name || "",
    description: service?.description || "",
    price: service?.price || 0,
    duration_minutes: service?.duration_minutes || 30,
    is_active: service?.is_active ?? true,
  });

  const [priceRaw, setPriceRaw] = useState(
    service?.price ? String(service.price) : ""
  );
  const priceFormatted = formatRupiahInput(priceRaw);

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, "");
    setPriceRaw(raw);
    setForm({ ...form, price: Number(raw) });
  };

  const managedShopIds = user?.managed_shop_ids || [];
  const [selectedShopId, setSelectedShopId] = useState(
    service?.shop_id || managedShopIds[0] || ""
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const payload = { ...form, shop_id: selectedShopId };

      if (!FEATURES.services) {
        if (service) {
          const updated = updateService(service.id, payload);
          if (updated) onUpdated?.(service.id, updated);
        } else {
          const created = createService(payload);
          onCreated?.(created);
        }
        onOpenChange(false);
        setForm({
          name: "",
          description: "",
          price: 0,
          duration_minutes: 30,
          is_active: true,
        });
        setPriceRaw("");
        setLoading(false);
        return;
      }

      if (service) {
        const updated = await api.put<Service>(
          `/shop-admin/services/${service.id}`,
          payload
        );
        onUpdated?.(service.id, updated);
      } else {
        const created = await api.post<Service>("/shop-admin/services", payload);
        onCreated?.(created);
      }
      onOpenChange(false);
      setForm({
        name: "",
        description: "",
        price: 0,
        duration_minutes: 30,
        is_active: true,
      });
      setPriceRaw("");
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setError("Fitur layanan belum tersedia di server.");
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gagal menyimpan layanan. Silakan coba lagi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit Layanan" : "Tambah Layanan Baru"}
          </DialogTitle>
        </DialogHeader>

        {error && (
          <div className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {managedShopIds.length > 1 && (
            <div className="space-y-1.5">
              <Label>Toko</Label>
              <select
                value={selectedShopId}
                onChange={(e) => setSelectedShopId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {managedShopIds.map((id) => (
                  <option key={id} value={id}>
                    {shopsById[id]?.name || id}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="svc-name">Nama Layanan *</Label>
            <Input
              id="svc-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Contoh: Potong Rambut Premium"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="svc-desc">Deskripsi</Label>
            <textarea
              id="svc-desc"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Deskripsi layanan..."
              rows={3}
              className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="svc-price">Harga (Rp) *</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  Rp
                </span>
                <Input
                  id="svc-price"
                  type="text"
                  inputMode="numeric"
                  value={priceFormatted}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className="pl-10"
                  required
                />
              </div>
              {priceFormatted && (
                <p className="text-xs text-muted-foreground">
                  = Rp {priceFormatted}
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="svc-duration">Durasi (menit)</Label>
              <Input
                id="svc-duration"
                type="number"
                min={1}
                value={form.duration_minutes}
                onChange={(e) =>
                  setForm({
                    ...form,
                    duration_minutes: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="svc-active"
              checked={form.is_active}
              onChange={(e) =>
                setForm({ ...form, is_active: e.target.checked })
              }
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="svc-active" className="text-sm font-normal">
              Aktif (tersedia untuk pelanggan)
            </Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Menyimpan..."
                : service
                  ? "Simpan Perubahan"
                  : "Tambah Layanan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
