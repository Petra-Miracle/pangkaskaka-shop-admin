"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/applicants", label: "Pelamar StreetBarber", icon: "✓" },
  { href: "/profile", label: "Profil", icon: "☺" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col bg-gradient-to-b from-[#0A2540] via-[#0F2E4F] to-[#1B4A7A] text-white">
      <div className="px-6 py-7">
        <p className="text-lg font-extrabold tracking-tight">PangkasKAKA</p>
        <p className="text-xs font-medium text-white/60">Admin Validator</p>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {NAV_ITEMS.map((item) => {
          const active =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? "bg-white/12 text-white shadow-inner"
                  : "text-white/70 hover:bg-white/8 hover:text-white"
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-4">
        <p className="truncate text-sm font-semibold">{user?.name}</p>
        <p className="truncate text-xs text-white/60">{user?.email}</p>
        <button
          onClick={logout}
          className="mt-3 w-full rounded-md border border-white/15 px-3 py-2 text-left text-xs font-semibold text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Keluar
        </button>
      </div>
    </aside>
  );
}
