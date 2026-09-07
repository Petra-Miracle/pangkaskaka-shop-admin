"use client";

import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

export default function ProfilePage() {
  const { user, shopsById, logout } = useAuth();
  const managedShopIds = user?.managed_shop_ids || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-extrabold text-text">Profil Admin</h1>

      <Card>
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-dim text-xl font-extrabold text-brand">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="text-lg font-bold text-text">{user?.name}</p>
            <p className="text-sm text-text-dim">{user?.email}</p>
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-text-dim">
          Toko yang Dikelola
        </h2>
        {managedShopIds.length === 0 ? (
          <p className="text-sm text-text-dim">
            Belum ada toko yang di-assign ke akun Anda oleh SuperAdmin.
          </p>
        ) : (
          <ul className="space-y-2">
            {managedShopIds.map((id) => (
              <li
                key={id}
                className="rounded-md border border-border px-3 py-2.5 text-sm"
              >
                <p className="font-semibold text-text">
                  {shopsById[id]?.name || "Memuat..."}
                </p>
                <p className="text-xs text-text-dim">
                  {shopsById[id]?.address || id}
                </p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Button variant="secondary" onClick={logout}>
        Keluar dari Akun
      </Button>
    </div>
  );
}
