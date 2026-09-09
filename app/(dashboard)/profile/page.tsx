"use client";

import { useAuth } from "@/contexts/AuthContext";
import { PageHeader } from "@/components/nav/page-header";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, shopsById, logout } = useAuth();

  const managedShopIds = user?.managed_shop_ids || [];
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Akun"
        title="Profil"
        description="Informasi akun Admin dan toko yang dikelola."
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="glass-card rounded-2xl p-6">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Informasi Akun
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-2xl font-bold text-primary">
              {initials}
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <p className="mt-1 text-xs font-semibold text-primary">Admin</p>
            </div>
          </div>
          <Button variant="destructive" className="mt-6 gap-2" onClick={logout}>
            <LogOut className="size-4" />
            Keluar
          </Button>
        </div>

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
    </div>
  );
}
