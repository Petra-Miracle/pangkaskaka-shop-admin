"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, LogOut, Menu, MoreHorizontal, ClipboardCheck, User } from "lucide-react";
import { Avatar as HeroAvatar, Button, Dropdown, Label, Separator } from "@heroui/react";
import { NAV_SECTIONS } from "@/lib/nav-items";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const BOTTOM_NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Pelamar", href: "/applicants", icon: ClipboardCheck },
  { label: "Profil", href: "/profile", icon: User },
];

export function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  function handleLogout() {
    logout();
    router.push("/login");
  }
  function isActive(href: string) {
    return href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);
  }

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-sidebar-border bg-sidebar/80 px-4 backdrop-blur-xl md:hidden">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(true)} aria-label="Buka menu" className="size-8 p-0">
            <Menu className="size-4.5" />
          </Button>
          <div className="relative flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-lg shadow-sm shadow-primary/25 ring-1 ring-white/40 ring-inset">
            <Image src="/pangkaskaka-logo.jpeg" alt="PangkasKAKA" fill sizes="28px" className="object-cover" priority />
          </div>
          <span className="text-sm font-bold tracking-tight">PangkasKAKA</span>
        </div>
        <ThemeToggle className="size-8" />
      </header>

      <nav className="fixed bottom-0 left-0 z-40 flex h-[64px] w-full items-stretch justify-around border-t border-sidebar-border bg-sidebar/90 px-2 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_24px_rgba(0,0,0,0.04)] backdrop-blur-xl md:hidden">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href} className={cn("relative flex w-full flex-col items-center justify-center gap-0.5 transition-transform active:scale-95", active ? "text-primary" : "text-muted-foreground")}>
              {active && <span className="absolute top-0 h-0.5 w-8 rounded-b-full bg-gradient-to-r from-primary to-primary/60" />}
              <div className={cn("flex items-center justify-center rounded-xl px-4 py-1", active && "bg-primary/10")}>
                <Icon className="size-4.5" />
              </div>
              <span className="text-[10px] font-semibold tracking-wide">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setDrawerOpen(true)} className="flex w-full flex-col items-center justify-center gap-0.5 text-muted-foreground transition-transform active:scale-95">
          <div className="flex items-center justify-center rounded-xl px-4 py-1">
            <MoreHorizontal className="size-4.5" />
          </div>
          <span className="text-[10px] font-semibold tracking-wide">Lainnya</span>
        </button>
      </nav>

      <Dialog open={drawerOpen} onOpenChange={setDrawerOpen}>
        <DialogContent showCloseButton={false} className="fixed inset-y-0 left-0 top-0 h-screen w-72 max-w-[85vw] -translate-x-0 -translate-y-0 rounded-none rounded-r-2xl border-r border-sidebar-border bg-sidebar p-0 shadow-popover data-open:slide-in-from-left data-closed:slide-out-to-left">
          <DialogTitle className="sr-only">Navigasi</DialogTitle>
          <div className="flex h-full flex-col">
            <div className="flex h-14 items-center gap-2.5 border-b border-sidebar-border/70 px-5">
              <div className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl shadow-md shadow-primary/25 ring-1 ring-white/40 ring-inset">
                <Image src="/pangkaskaka-logo.jpeg" alt="PangkasKAKA" fill sizes="36px" className="object-cover" priority />
                <span className="absolute -right-0.5 -bottom-0.5 size-2.5 rounded-full border-2 border-sidebar bg-emerald-500" />
              </div>
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight">PangkasKAKA</p>
                <p className="text-[11px] font-medium text-muted-foreground">Admin Console</p>
              </div>
            </div>
            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
              {NAV_SECTIONS.map((section) => (
                <div key={section.label}>
                  <p className="mb-2 px-3 text-[10px] font-semibold tracking-[0.16em] text-muted-foreground/60 uppercase">{section.label}</p>
                  <div className="space-y-1">
                    {section.items.map((item) => {
                      const active = isActive(item.href);
                      const Icon = item.icon;
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setDrawerOpen(false)} className={cn("relative flex items-center gap-3 overflow-hidden rounded-xl px-3 py-2.5 text-sm font-medium transition-all", active ? "bg-gradient-to-r from-primary/15 via-primary/8 to-transparent text-sidebar-accent-foreground shadow-sm" : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                          {active && <span className="absolute top-1/2 left-0 h-1/2 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-primary to-primary/60" />}
                          <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                          <span className="flex-1">{item.label}</span>
                          {item.blocked && <Badge variant="outline" className="text-[10px] font-normal text-muted-foreground">Segera</Badge>}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
            <div className="border-t border-sidebar-border/70 p-4">
              {user && (
                <Dropdown>
                  <Dropdown.Trigger className="w-full">
                    <button className="flex w-full items-center gap-2.5 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/30 p-2 text-left transition-colors hover:bg-sidebar-accent/60">
                      <HeroAvatar.Root size="sm" variant="soft" color="accent" className="size-8 border border-primary/20">
                        <HeroAvatar.Fallback className="text-xs font-bold">{initials}</HeroAvatar.Fallback>
                      </HeroAvatar.Root>
                      <div className="min-w-0 flex-1 text-sm">
                        <p className="truncate font-semibold">{user.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </button>
                  </Dropdown.Trigger>
                  <Dropdown.Popover placement="top start">
                    <div className="px-3 pt-3 pb-1">
                      <div className="flex items-center gap-2.5">
                        <HeroAvatar.Root size="sm" variant="soft" color="accent" className="size-8 border border-primary/20">
                          <HeroAvatar.Fallback className="text-xs font-bold">{initials}</HeroAvatar.Fallback>
                        </HeroAvatar.Root>
                        <div className="min-w-0 flex-1 leading-tight">
                          <p className="truncate text-sm font-semibold">{user.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </div>
                    <Separator />
                    <Dropdown.Menu onAction={(key) => { if (key === "logout") handleLogout(); }}>
                      <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                        <div className="flex w-full items-center justify-between gap-2">
                          <Label>Log Out</Label>
                          <LogOut className="size-3.5 text-destructive" />
                        </div>
                      </Dropdown.Item>
                    </Dropdown.Menu>
                  </Dropdown.Popover>
                </Dropdown>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
