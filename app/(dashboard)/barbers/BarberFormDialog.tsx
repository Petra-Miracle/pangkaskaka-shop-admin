"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Barber, BarberFormData } from "@/lib/types";
import { createBarber, updateBarber } from "@/lib/storage";
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

interface BarberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  barber?: Barber;
  onCreated?: (barber: Barber) => void;
  onUpdated?: (id: string, patch: Partial<Barber>) => void;
}

export function BarberFormDialog({
  open,
  onOpenChange,
  barber,
  onCreated,
  onUpdated,
}: BarberFormDialogProps) {
  const { user, shopsById } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const managedShopIds = user?.managed_shop_ids || [];
  const [selectedShopId, setSelectedShopId] = useState(
    barber?.shop_id || managedShopIds[0] || ""
  );

  const [name, setName] = useState(barber?.name || "");
  const [phone, setPhone] = useState(barber?.phone || "");
  const [email, setEmail] = useState(barber?.email || "");
  const [specialization, setSpecialization] = useState(barber?.specialization || "");
  const [isActive, setIsActive] = useState(barber?.is_active ?? true);

  useEffect(() => {
    if (open) {
      setName(barber?.name || "");
      setPhone(barber?.phone || "");
      setEmail(barber?.email || "");
      setSpecialization(barber?.specialization || "");
      setIsActive(barber?.is_active ?? true);
      setSelectedShopId(barber?.shop_id || managedShopIds[0] || "");
      setError(null);
    }
  }, [open, barber, managedShopIds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: BarberFormData & { shop_id: string } = {
      name,
      phone: phone || undefined,
      email: email || undefined,
      specialization: specialization || undefined,
      is_active: isActive,
      shop_id: selectedShopId,
    };

    try {
      if (!FEATURES.barbers) {
        if (barber) {
          const updated = updateBarber(barber.id, payload);
          if (updated) onUpdated?.(barber.id, updated);
        } else {
          const created = createBarber(payload);
          onCreated?.(created);
        }
        onOpenChange(false);
        return;
      }

      if (barber) {
        const res = await api.put<{ ok: boolean }>(
          `/shop-admin/barbers/${barber.id}`,
          payload
        );
        onUpdated?.(barber.id, payload);
      } else {
        const res = await api.post<{ barber: Barber }>(
          "/shop-admin/barbers",
          payload
        );
        onCreated?.(res.barber);
      }
      onOpenChange(false);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        if (barber) {
          const updated = updateBarber(barber.id, payload);
          if (updated) onUpdated?.(barber.id, updated);
        } else {
          const created = createBarber(payload);
          onCreated?.(created);
        }
        onOpenChange(false);
      } else {
        setError(
          err instanceof ApiError
            ? err.message
            : "Gagal menyimpan data karyawan. Silakan coba lagi."
        );
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {barber ? "Edit Karyawan" : "Tambah Karyawan Baru"}
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
            <Label htmlFor="barber-name">Nama Lengkap *</Label>
            <Input
              id="barber-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="barber-phone">No. HP</Label>
              <Input
                id="barber-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="08xxxxxxxxxx"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="barber-email">Email</Label>
              <Input
                id="barber-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="budi@email.com"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="barber-spec">Spesialisasi</Label>
            <Input
              id="barber-spec"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="Contoh: Potong Rambut Pria, System Fade"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="barber-active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-input"
            />
            <Label htmlFor="barber-active" className="text-sm font-normal">
              Aktif (masih bekerja)
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
            <Button type="submit">
              {barber ? "Simpan Perubahan" : "Tambah Karyawan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
