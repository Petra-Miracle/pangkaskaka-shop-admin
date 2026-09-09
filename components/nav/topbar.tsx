"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronRight, LayoutDashboard, LogOut } from "lucide-react";
import { Avatar as HeroAvatar, Button, Dropdown, Label } from "@heroui/react";
import { ThemeToggle } from "@/components/nav/theme-toggle";
import { NAV_SECTIONS } from "@/lib/nav-items";
import { useAuth } from "@/contexts/AuthContext";

function useCurrentPage() {
  const pathname = usePathname();
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      const active = item.href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(item.href);
      if (active) return { section: section.label, page: item.label, href: item.href };
    }
  }
  return null;
}

export function Topbar() {
  const { user, logout } = useAuth();
  const current = useCurrentPage();
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  return (
    <header className="sticky top-0 z-30 hidden h-16 shrink-0 items-center border-b border-sidebar-border bg-sidebar/80 backdrop-blur-xl md:flex">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 items-center gap-1.5 text-sm">
          {current ? (
            <>
              <Link href={current.href} className="flex items-center gap-1.5 font-medium text-muted-foreground transition-colors hover:text-foreground">
                <LayoutDashboard className="size-3.5" />
                {current.section}
              </Link>
              <ChevronRight className="size-3.5 text-muted-foreground/50" />
              <span className="truncate font-semibold text-foreground">{current.page}</span>
            </>
          ) : (
            <span className="font-semibold">PangkasKAKA Admin</span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          {user && (
            <Dropdown>
              <Button
                aria-label="Menu akun"
                variant="secondary"
                className="ml-1 flex items-center gap-2 rounded-full border border-sidebar-border/70 bg-background/60 py-0.5 pr-2 pl-0.5 font-normal transition-colors hover:border-primary/25"
              >
                <HeroAvatar.Root size="sm" variant="soft" color="accent" className="size-7 border border-primary/20">
                  <HeroAvatar.Fallback className="text-[10px] font-bold">{initials}</HeroAvatar.Fallback>
                </HeroAvatar.Root>
                <span className="hidden max-w-32 truncate text-xs font-semibold lg:inline">{user.name}</span>
              </Button>
              <Dropdown.Popover placement="bottom end">
                <Dropdown.Menu onAction={(key) => { if (key === "logout") logout(); }}>
                  <Dropdown.Item id="user-info" textValue={user.name} isDisabled>
                    <Label className="opacity-100">
                      <p className="truncate text-sm font-semibold text-foreground">{user.name}</p>
                      <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    </Label>
                  </Dropdown.Item>
                  <Dropdown.Item id="logout" textValue="Log out" variant="danger">
                    <Label className="flex items-center gap-2 opacity-100">
                      <LogOut className="size-4" />
                      Log out
                    </Label>
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown.Popover>
            </Dropdown>
          )}
        </div>
      </div>
    </header>
  );
}
