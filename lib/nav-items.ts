import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ClipboardCheck, User } from "lucide-react";

export type NavItem = { label: string; href: string; icon: LucideIcon; blocked?: boolean };
export type NavSection = { label: string; items: NavItem[] };

export const NAV_SECTIONS: NavSection[] = [
  {
    label: "Utama",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "Manajemen",
    items: [
      { label: "Pelamar StreetBarber", href: "/applicants", icon: ClipboardCheck },
    ],
  },
  {
    label: "Akun",
    items: [
      { label: "Profil", href: "/profile", icon: User },
    ],
  },
];
