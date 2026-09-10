"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  CalendarDays,
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { logout } from "../login/actions";
import { cn } from "@/lib/cn";

const NAV_LINKS = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/agenda", label: "Agenda", icon: CalendarDays },
  { href: "/pacientes", label: "Pacientes", icon: Users },
  { href: "/administracion", label: "Administración", icon: Wallet },
  { href: "/facturacion", label: "Facturación", icon: Receipt },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3">
        <span className="font-semibold text-foreground">Agenda Médica</span>

        <nav className="hidden gap-1 sm:flex">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-muted hover:bg-neutral-bg hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <form action={logout} className="ml-auto hidden sm:block">
          <button
            type="submit"
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:bg-neutral-bg hover:text-foreground"
          >
            <LogOut className="h-4 w-4" aria-hidden />
            Cerrar sesión
          </button>
        </form>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md text-muted hover:bg-neutral-bg hover:text-foreground sm:hidden"
        >
          {open ? <X className="h-5 w-5" aria-hidden /> : <Menu className="h-5 w-5" aria-hidden />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-border bg-surface px-4 py-2 sm:hidden">
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium",
                  active ? "bg-brand-50 text-brand-700" : "text-muted hover:bg-neutral-bg hover:text-foreground"
                )}
              >
                <link.icon className="h-4 w-4" aria-hidden />
                {link.label}
              </Link>
            );
          })}
          <form action={logout} className="mt-1 border-t border-border pt-2">
            <button
              type="submit"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-muted hover:bg-neutral-bg hover:text-foreground"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Cerrar sesión
            </button>
          </form>
        </nav>
      )}
    </header>
  );
}
