"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { ServiceIcon } from "@/components/ui/service-icon";
import { t } from "@/i18n/pl";
import { ThemeToggle } from "./theme-toggle";

export type NavService = { slug: string; name: string; summary: string; icon: string };

const mainLinks = [
  { href: "/pakiety", label: t.nav.packages },
  { href: "/abonamenty", label: t.nav.plans },
  { href: "/realizacje", label: t.nav.work },
  { href: "/o-nas", label: t.nav.about },
  { href: "/blog", label: t.nav.blog },
  { href: "/kontakt", label: t.nav.contact },
];

export function Header({ services }: { services: NavService[] }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // zamknij menu po zmianie strony
  useEffect(() => {
    setMobileOpen(false);
    setMegaOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMegaOpen(false);
        setMobileOpen(false);
      }
    };
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onClick);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const servicesActive = isActive("/uslugi");

  return (
    <header
      className={`sticky top-0 z-50 bg-bg transition-[border-color] duration-200 ${
        scrolled || megaOpen ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="container-v flex h-[var(--header-h)] items-center gap-6">
        <Logo />

        <nav aria-label="Główna nawigacja" className="ml-4 hidden lg:block">
          <ul className="flex items-center gap-1">
            <li ref={megaRef} className="relative">
              <button
                type="button"
                aria-expanded={megaOpen}
                aria-controls="mega-uslugi"
                onClick={() => setMegaOpen((v) => !v)}
                className={`inline-flex h-10 items-center gap-1 rounded-full px-3.5 text-[0.95rem] font-medium transition-colors hover:bg-surface-2 ${
                  servicesActive ? "text-ink" : "text-ink-2 hover:text-ink"
                }`}
              >
                {t.nav.services}
                <ChevronDown size={15} className={`transition-transform ${megaOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {megaOpen && (
                <div
                  id="mega-uslugi"
                  className="enter absolute left-0 top-[calc(100%+12px)] w-[min(880px,calc(100vw-4rem))] rounded-[var(--radius-lg)] border border-line bg-surface p-3 shadow-[var(--shadow-pop)]"
                  style={{ animationDuration: "0.35s" }}
                >
                  <ul className="grid grid-cols-3 gap-0.5">
                    {services.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/uslugi/${s.slug}`}
                          className="group flex gap-3 rounded-[var(--radius)] p-3 transition-colors hover:bg-surface-2"
                        >
                          <span className="mt-0.5 text-ink-3 transition-colors group-hover:text-accent">
                            <ServiceIcon name={s.icon} size={20} />
                          </span>
                          <span>
                            <span className="block text-[0.95rem] font-semibold leading-snug text-ink">{s.name}</span>
                            <span className="mt-1 block text-[0.82rem] leading-snug text-ink-3 line-clamp-2">{s.summary}</span>
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-2 flex items-center justify-between rounded-[var(--radius)] bg-surface-2 px-4 py-3">
                    <span className="text-sm text-ink-2">Nie wiesz, od czego zacząć? Opisz cel, a dobierzemy zakres.</span>
                    <Link href="/uslugi" className="link-u text-sm">
                      {t.nav.allServices}
                    </Link>
                  </div>
                </div>
              )}
            </li>
            {mainLinks.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={isActive(l.href) ? "page" : undefined}
                  className={`inline-flex h-10 items-center rounded-full px-3.5 text-[0.95rem] font-medium transition-colors hover:bg-surface-2 ${
                    isActive(l.href) ? "text-ink" : "text-ink-2 hover:text-ink"
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <ThemeToggle />
          <div className="hidden items-center gap-1 xl:flex">
            <Link href="/logowanie" className="btn btn-ghost btn-sm">
              {t.nav.login}
            </Link>
            <Link href="/rejestracja" className="btn btn-outline btn-sm">
              {t.nav.register}
            </Link>
          </div>
          <Link href="/wycena" className="btn btn-primary btn-sm ml-1 hidden sm:inline-flex">
            {t.nav.cta}
          </Link>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full hover:bg-surface-2 lg:hidden"
            aria-expanded={mobileOpen}
            aria-controls="menu-mobilne"
            aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div
          id="menu-mobilne"
          className="fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 overflow-y-auto border-t border-line bg-bg lg:hidden"
        >
          <nav aria-label="Menu mobilne" className="container-v py-6">
            <p className="t-small t-faint mb-2 font-semibold">{t.nav.services}</p>
            <ul className="grid gap-0.5 sm:grid-cols-2">
              {services.map((s) => (
                <li key={s.slug}>
                  <Link href={`/uslugi/${s.slug}`} className="flex items-center gap-3 rounded-[var(--radius-sm)] py-2.5 pr-2 text-[1.02rem] font-medium">
                    <span className="text-ink-3"><ServiceIcon name={s.icon} size={18} /></span>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <ul className="rule mt-5 grid gap-1 pt-5">
              {mainLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="block py-2 text-2xl font-bold tracking-tight">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="rule mt-6 grid gap-2 pt-6 sm:grid-cols-3">
              <Link href="/wycena" className="btn btn-primary">{t.nav.cta}</Link>
              <Link href="/logowanie" className="btn btn-outline">{t.nav.login}</Link>
              <Link href="/rejestracja" className="btn btn-outline">{t.nav.register}</Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
