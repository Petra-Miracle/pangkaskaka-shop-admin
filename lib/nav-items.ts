import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ClipboardCheck,
  Package,
  Scissors,
  TrendingUp,
  User,
} from "lucide-react";

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
    label: "Usaha",
    items: [
      { label: "Katalog Produk", href: "/products", icon: Package },
      { label: "Layanan", href: "/services", icon: Scissors },
    ],
  },
  {
    label: "Keuangan",
    items: [
      { label: "Revenue", href: "/revenue", icon: TrendingUp },
    ],
  },
  {
    label: "Akun",
    items: [
      { label: "Profil", href: "/profile", icon: User },
    ],
  },
];
