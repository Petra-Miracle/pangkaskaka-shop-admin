"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
import { FEATURES } from "@/lib/features";
import { Barber, Service } from "@/lib/types";
import { PageHeader } from "@/components/nav/page-header";
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
import {
  LogOut,
  Camera,
  Lock,
  Phone,
  Calendar,
  Clock,
  Scissors,
  Store,
  ChevronRight,
  ShieldCheck,
  FileText,
  Upload,
  ExternalLink,
} from "lucide-react";

export default function ProfilePage() {
  const { user, shopsById, logout, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [sopUploading, setSopUploading] = useState(false);
  const [sopError, setSopError] = useState<string | null>(null);
  const sopFileInputRef = useRef<HTMLInputElement>(null);

  const [barberCount, setBarberCount] = useState<Record<string, number>>({});
  const [serviceCount, setServiceCount] = useState<Record<string, number>>({});

  const managedShopIds = user?.managed_shop_ids || [];
  const shopId = managedShopIds[0];
  const shop = shopId ? shopsById[shopId] : null;
  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const fetchShopCounts = useCallback(async () => {
    let allBarbers: Barber[] = [];
    let allServices: Service[] = [];

    if (FEATURES.barbers) {
      try {
        const res = await api.get<{ barbers: Barber[] }>("/shop-admin/barbers");
        allBarbers = res.barbers || [];
      } catch {
        allBarbers = [];
      }
    }

    if (FEATURES.services) {
      try {
        const res = await api.get<{ services: Service[] }>("/shop-admin/services");
        allServices = res.services || [];
      } catch {
        allServices = [];
      }
    }

    if (shopId) {
      const bCount = allBarbers.filter(
        (b) => b.shop_id === shopId && (b.is_active !== false || b.status === "active")
      ).length;
      const sCount = allServices.filter(
        (s) => s.shop_id === shopId
      ).length;

      setBarberCount({ [shopId]: bCount });
      setServiceCount({ [shopId]: sCount });
    }
  }, [shopId]);

  useEffect(() => {
    if (shopId) fetchShopCounts();
  }, [shopId, fetchShopCounts]);

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert("Ukuran foto maksimal 2MB. Silakan pilih foto yang lebih kecil.");
        if (fileInputRef.current) fileInputRef.current.value = "";
        return;
      }

      setUploading(true);
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        await api.put("/auth/profile", { photo: base64 });
        await refresh();
      } catch (err) {
        alert(
          err instanceof ApiError
            ? err.message
            : "Gagal mengupload foto. Silakan coba lagi."
        );
      } finally {
        setUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    },
    [refresh]
  );

  const handleSopUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !shopId) return;

      if (file.type !== "application/pdf") {
        setSopError("Hanya file PDF yang diterima.");
        if (sopFileInputRef.current) sopFileInputRef.current.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setSopError("Ukuran file maksimal 5MB.");
        if (sopFileInputRef.current) sopFileInputRef.current.value = "";
        return;
      }

      setSopUploading(true);
      setSopError(null);
      try {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        const res = await api.put<{ ok: boolean; sop_document_url: string }>(
          `/shop-admin/shops/${shopId}/sop`,
          { shop_id: shopId, document: base64 }
        );

        if (res.ok && res.sop_document_url) {
          await refresh();
        }
      } catch (err) {
        setSopError(
          err instanceof ApiError
            ? err.message
            : "Gagal mengunggah dokumen SOP. Silakan coba lagi."
        );
      } finally {
        setSopUploading(false);
        if (sopFileInputRef.current) sopFileInputRef.current.value = "";
      }
    },
    [shopId, refresh]
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Profil"
        description="Kelola informasi akun dan toko Anda."
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[auto_1fr]">
        {/* Left: Profile Card */}
        <div className="glass-card rounded-2xl p-6 w-full lg:w-[340px]">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative mb-3">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 blur-sm" />
              <div className="relative">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="size-24 rounded-full object-cover ring-4 ring-background shadow-lg"
                  />
                ) : (
                  <div className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-primary/5 text-3xl font-bold text-primary ring-4 ring-background shadow-lg">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 disabled:opacity-50"
                >
                  {uploading ? (
                    <div className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    <Camera className="size-3.5" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground">
              {user?.name}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user?.email}
            </p>

            <div className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="size-3.5" />
              Admin
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Info Rows */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                <Phone className="size-4" />
                Telepon
              </div>
              <span className="text-sm font-medium text-foreground">
                {user?.phone || "+62 ---"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                <Calendar className="size-4" />
                Bergabung
              </div>
              <span className="text-sm font-medium text-foreground shrink-0">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "-"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
                <Clock className="size-4" />
                Login terakhir
              </div>
              <span className="text-sm font-medium text-foreground shrink-0">
                {user?.last_login
                  ? new Date(user.last_login).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : "Sesi aktif"}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Action Buttons */}
          <button
            type="button"
            onClick={() => setChangePasswordOpen(true)}
            className="flex w-full items-center gap-3 rounded-xl border border-border/50 bg-background/50 px-4 py-2.5 text-left text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
          >
            <Lock className="size-4 text-muted-foreground" />
            Ganti password
          </button>

          {/* Divider */}
          <div className="my-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          {/* Logout */}
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-destructive/20 bg-destructive/5 py-2.5 text-sm font-medium text-destructive transition-all hover:bg-destructive/10 hover:border-destructive/30"
          >
            <LogOut className="size-4" />
            Keluar
          </button>
        </div>

        {/* Right: Shop Card */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              Toko yang Dikelola
            </h2>
          </div>

          {!shopId ? (
            <div className="rounded-xl border border-dashed border-border p-8 text-center">
              <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Store className="size-6" />
              </div>
              <p className="text-sm text-muted-foreground">
                Belum ada toko yang di-assign ke akun ini.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/50 bg-background/30 p-5 transition-all hover:border-primary/30">
              {/* Shop Header */}
              <div className="flex items-start gap-3 mb-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Scissors className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-foreground truncate">
                      {shop?.name || shopId}
                    </p>
                    <span className="shrink-0 rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-bold text-success">
                      Buka
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground truncate">
                    {shop?.address || "Alamat belum tersedia"}
                  </p>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Jam operasional</p>
                  <p className="text-sm font-bold text-foreground">
                    {shop?.operating_hours || "09.00 - 21.00"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Telepon toko</p>
                  <p className="text-sm font-bold text-foreground">
                    {shop?.phone || "-"}
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Barber aktif</p>
                  <p className="text-sm font-bold text-foreground">
                    {barberCount[shopId] || 0} orang
                  </p>
                </div>
                <div className="rounded-xl bg-muted/30 p-3">
                  <p className="text-[11px] font-medium text-muted-foreground mb-1">Layanan tersedia</p>
                  <p className="text-sm font-bold text-foreground">
                    {serviceCount[shopId] || 0} layanan
                  </p>
                </div>
              </div>

              {/* Lihat Karyawan Button */}
              <Link href="/barbers">
                <button
                  type="button"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                >
                  Lihat karyawan
                  <ChevronRight className="size-4" />
                </button>
              </Link>
            </div>
          )}

          {/* SOP Section */}
          {shopId && (
            <div className="mt-4 rounded-2xl border border-border/50 bg-background/30 p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Dokumen SOP</p>
                  <p className="text-xs text-muted-foreground">
                    Standar Operasional Prosedur untuk StreetBarber
                  </p>
                </div>
              </div>

              {sopError && (
                <div className="mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                  {sopError}
                </div>
              )}

              {shop?.sop_document_url ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="size-2 rounded-full bg-success" />
                    <span>SOP sudah diunggah</span>
                    {shop.sop_updated_at && (
                      <span>
                        — {new Date(shop.sop_updated_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <a
                      href={shop.sop_document_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 py-2.5 text-sm font-medium text-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <ExternalLink className="size-4" />
                      Lihat SOP
                    </a>
                    <button
                      type="button"
                      onClick={() => sopFileInputRef.current?.click()}
                      disabled={sopUploading}
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {sopUploading ? (
                        <>
                          <div className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Ganti Dokumen
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center">
                  <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Upload className="size-5" />
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    Belum ada dokumen SOP. Unggah dokumen PDF berisi SOP untuk StreetBarber.
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => sopFileInputRef.current?.click()}
                      disabled={sopUploading}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
                    >
                      {sopUploading ? (
                        <>
                          <div className="size-3.5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                          Mengunggah...
                        </>
                      ) : (
                        <>
                          <Upload className="size-4" />
                          Unggah Dokumen SOP
                        </>
                      )}
                    </button>
                    <a
                      href="/SOP-StreetBarber-PangkasKAKA.md"
                      download
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/50 bg-background/50 px-4 py-2 text-xs font-medium text-muted-foreground transition-all hover:border-primary/30 hover:bg-primary/5"
                    >
                      <FileText className="size-3.5" />
                      Unduh Template SOP (Markdown)
                    </a>
                  </div>
                </div>
              )}

              <input
                ref={sopFileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleSopUpload}
              />
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />
    </div>
  );
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError("Password baru tidak cocok.");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    setSubmitting(true);
    try {
      await api.put("/auth/change-password", {
        old_password: oldPassword,
        new_password: newPassword,
      });
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      onOpenChange(false);
      alert("Password berhasil diubah!");
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Gagal mengubah password. Silakan coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Lock className="size-4" />
            </div>
            Ganti Password
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Password Lama</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Masukkan password lama"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Masukkan password baru"
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Ulangi password baru"
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Menyimpan..." : "Simpan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
