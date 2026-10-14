"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ChartLine,
  CircleHelp,
  ExternalLink,
  Inbox,
  SquareKanban,
  LayoutDashboard,
  LogOut,
  Menu,
  ScrollText,
  Settings,
  Tags,
  Users,
  X,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { logoutAction } from "@/app/admin/actions";

const nav = [
  { href: "/admin", label: "Pulpit", icon: LayoutDashboard, exact: true },
  { href: "/admin/zgloszenia", label: "Zgłoszenia", icon: Inbox, badge: "new" as const },
  { href: "/admin/crm", label: "CRM i lejek", icon: SquareKanban },
  { href: "/admin/sprzedaz", label: "Sprzedaż", icon: ChartLine },
  { href: "/admin/oferta", label: "Oferta i ceny", icon: Tags },
  { href: "/admin/blog", label: "Blog", icon: BookOpen },
  { href: "/admin/faq", label: "FAQ", icon: CircleHelp },
  { href: "/admin/uzytkownicy", label: "Konta użytkowników", icon: Users },
  { href: "/admin/dziennik", label: "Dziennik zmian", icon: ScrollText },
  { href: "/admin/ustawienia", label: "Ustawienia", icon: Settings },
];

export function AdminShell({ children, newLeads }: { children: ReactNode; newLeads: number }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);

  const active = (href: string, exact?: boolean) => (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
  const current = nav.find((n) => active(n.href, n.exact));

  return (
    <div className="adm">
      <aside className={`adm-side ${open ? "is-open" : ""}`} aria-label="Menu panelu">
        <div className="flex items-center justify-between px-2">
          <Logo href="/admin" />
          <button type="button" className="grid size-9 place-items-center rounded-full lg:hidden" onClick={() => setOpen(false)} aria-label="Zamknij menu">
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <nav className="adm-nav grid gap-0.5">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} aria-current={active(n.href, n.exact) ? "page" : undefined}>
              <n.icon size={18} strokeWidth={1.8} aria-hidden="true" />
              {n.label}
              {n.badge === "new" && newLeads > 0 && <span className="count" aria-label={`${newLeads} nowych`}>{newLeads}</span>}
            </Link>
          ))}
        </nav>
        <div className="mt-auto grid gap-1 border-t border-line pt-4">
          <a href="/" target="_blank" rel="noopener" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface hover:text-ink">
            <ExternalLink size={16} aria-hidden="true" /> Zobacz stronę
          </a>
          <form action={logoutAction}>
            <button type="submit" className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-ink-2 hover:bg-surface hover:text-danger">
              <LogOut size={16} aria-hidden="true" /> Wyloguj
            </button>
          </form>
        </div>
      </aside>
      {open && <button type="button" aria-label="Zamknij menu" className="fixed inset-0 z-50 bg-black/50 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="adm-main">
        <header className="adm-top">
          <button type="button" className="grid size-10 place-items-center rounded-full border border-line lg:hidden" onClick={() => setOpen(true)} aria-label="Otwórz menu">
            <Menu size={18} aria-hidden="true" />
          </button>
          <p className="font-semibold">{current?.label ?? "Panel"}</p>
          <div className="ml-auto flex items-center gap-2">
            <span className="tag hidden sm:inline-flex">Właściciel</span>
            <ThemeToggle />
          </div>
        </header>
        <main id="tresc" className="adm-content">
          {children}
        </main>
      </div>
    </div>
  );
}
