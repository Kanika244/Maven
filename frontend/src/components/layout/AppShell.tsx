import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Bell, Menu, Search, X } from "lucide-react";
import { Brand } from "./Brand";
import { navGroups, navItems } from "./nav";
import { cx } from "@/lib/format";
import { investor } from "@/lib/mock-data";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function NavList({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group}>
          <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {group}
          </div>
          <div className="flex flex-col gap-0.5">
            {navItems
              .filter((i) => i.group === group)
              .map((item) => {
                const active =
                  item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cx(
                      "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-foreground",
                    )}
                  >
                    <item.icon
                      className={cx(
                        "h-4 w-4 shrink-0",
                        active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function UserCard() {
  return (
    <Link
      to="/profile"
      className="mx-3 mb-3 flex items-center gap-3 rounded-xl border border-sidebar-border bg-sidebar-accent/60 p-3 transition-colors hover:bg-sidebar-accent"
    >
      <Avatar className="h-9 w-9">
        <AvatarFallback className="bg-primary/20 font-num text-sm font-semibold text-primary">
          {investor.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 leading-tight">
        <div className="truncate text-sm font-medium">{investor.name}</div>
        <div className="truncate text-xs text-muted-foreground">{investor.plan} · {investor.riskProfile}</div>
      </div>
    </Link>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen w-full bg-background">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <div className="flex h-16 items-center border-b border-sidebar-border px-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavList pathname={pathname} />
        </div>
        <UserCard />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/70 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col border-r border-sidebar-border bg-sidebar">
            <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
              <Brand />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <NavList pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            </div>
            <UserCard />
          </aside>
        </div>
      )}

      {/* Main column */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="relative hidden max-w-md flex-1 sm:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search stocks, insights, news…"
              className="h-9 border-border/60 bg-card/60 pl-9"
            />
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-full border border-border/60 bg-card/60 px-3 py-1.5 text-xs md:flex">
              <span className="h-2 w-2 animate-pulse rounded-full bg-positive" />
              <span className="text-muted-foreground">NIFTY</span>
              <span className="font-num font-semibold">24,731.40</span>
              <span className="font-num font-medium text-positive">+0.69%</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-primary" />
            </Button>
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      </div>
    </div>
  );
}