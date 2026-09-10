"use client";

import { useCallback, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { api, ApiError } from "@/lib/api";
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
import { LogOut, Camera, Lock, Mail, Save, Upload } from "lucide-react";

export default function ProfilePage() {
  const { user, shopsById, logout, refresh } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [changeEmailOpen, setChangeEmailOpen] = useState(false);

  const managedShopIds = user?.managed_shop_ids || [];
  const initials = user?.name
    ?.split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const handlePhotoUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

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

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Profil"
        description="Informasi akun Admin dan toko yang dikelola."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Account Info */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Informasi Akun
          </h2>

          {/* Profile Picture */}
          <div className="flex items-center gap-4">
            <div className="relative">
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="size-16 rounded-2xl object-cover"
                />
              ) : (
                <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary/90 disabled:opacity-50"
              >
                {uploading ? (
                  <div className="size-3 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                ) : (
                  <Camera className="size-3" />
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
            <div>
              <p className="text-lg font-bold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs font-semibold text-primary">Admin</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setChangePasswordOpen(true)}
            >
              <Lock className="size-4" />
              Ganti Password
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setChangeEmailOpen(true)}
            >
              <Mail className="size-4" />
              Ganti Email
            </Button>
          </div>

          <Button variant="destructive" className="mt-6 gap-2" onClick={logout}>
            <LogOut className="size-4" />
            Keluar
          </Button>
        </div>

        {/* Right: Shops */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Toko yang Dikelola
          </h2>
          {managedShopIds.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Belum ada toko yang di-assign ke akun ini.
            </p>
          ) : (
            <div className="space-y-3">
              {managedShopIds.map((shopId) => {
                const shop = shopsById[shopId];
                return (
                  <div key={shopId} className="rounded-xl border border-border p-3">
                    <p className="font-semibold text-foreground">
                      {shop?.name || shopId}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {shop?.address || "Alamat belum tersedia"}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Change Password Dialog */}
      <ChangePasswordDialog
        open={changePasswordOpen}
        onOpenChange={setChangePasswordOpen}
      />

      {/* Change Email Dialog */}
      <ChangeEmailDialog
        open={changeEmailOpen}
        onOpenChange={setChangeEmailOpen}
        currentEmail={user?.email || ""}
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
          <DialogTitle>Ganti Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Password Lama</Label>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Password Baru</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Konfirmasi Password Baru</Label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
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

function ChangeEmailDialog({
  open,
  onOpenChange,
  currentEmail,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentEmail: string;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Ganti Email</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Untuk mengganti email akun, silakan hubungi Super Admin.
          </p>
          <div className="rounded-xl border border-border p-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">
              Email Saat Ini
            </p>
            <p className="mt-1 font-medium text-foreground">{currentEmail}</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
