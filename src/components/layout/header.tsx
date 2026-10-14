"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowUpRight, ChevronDown, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Logo } from "@/components/brand/logo";
import { Magnetic } from "@/components/motion/interactive";
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
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaRef = useRef<HTMLLIElement>(null);

  // tło po przewinięciu; chowanie przy przewijaniu w dół, pokazywanie przy przewijaniu w górę
  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 12);
      setHidden(y > 240 && y > last + 2);
      if (y < last - 2) setHidden(false);
      last = y;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
  const headerClass = [
    "site-header",
    scrolled || megaOpen ? "is-scrolled" : "",
    hidden && !megaOpen && !mobileOpen ? "is-hidden" : "",
  ].join(" ");

  return (
    <>
      <header className={headerClass}>
        <div className="container-v flex h-[var(--header-h)] items-center gap-4">
          <div className="relative z-[2]">
            <Logo />
          </div>

          <nav aria-label="Główna nawigacja" className="ml-4 hidden lg:block">
            <ul className="flex items-center">
              <li ref={megaRef} className="relative">
                <button
                  type="button"
                  aria-expanded={megaOpen}
                  aria-controls="mega-uslugi"
                  onClick={() => setMegaOpen((v) => !v)}
                  className="nav-link"
                  aria-current={isActive("/uslugi") ? "page" : undefined}
                >
                  {t.nav.services}
                  <ChevronDown size={15} className={`transition-transform duration-300 ${megaOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {megaOpen && (
                  <div id="mega-uslugi" className="mega">
                    <ul className="grid grid-cols-3 gap-0.5">
                      {services.map((s) => (
                        <li key={s.slug}>
                          <Link href={`/uslugi/${s.slug}`} className="mega-link">
                            <span className="mega-ico"><ServiceIcon name={s.icon} size={19} /></span>
                            <span>
                              <span className="block text-[0.95rem] font-semibold leading-snug">{s.name}</span>
                              <span className="mt-1 block text-[0.8rem] leading-snug text-ink-3 line-clamp-2">{s.summary}</span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 flex items-center justify-between gap-4 rounded-[var(--radius)] bg-accent px-5 py-4 text-white">
                      <span className="text-sm font-medium">Nie wiesz, od czego zacząć? Opisz cel, a dobierzemy zakres.</span>
                      <Link href="/wycena" className="inline-flex shrink-0 items-center gap-1 text-sm font-bold">
                        Wyceń projekt <ArrowUpRight size={16} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                )}
              </li>
              {mainLinks.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} aria-current={isActive(l.href) ? "page" : undefined} className="nav-link">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="relative z-[2] ml-auto flex items-center gap-1.5">
            <ThemeToggle />
            <div className="hidden items-center gap-1 xl:flex">
              <Link href="/logowanie" className="btn btn-ghost btn-sm">{t.nav.login}</Link>
              <Link href="/rejestracja" className="btn btn-outline btn-sm hidden 2xl:inline-flex">{t.nav.register}</Link>
            </div>
            <Magnetic strength={0.25} className="ml-1 hidden sm:inline-flex">
              <Link href="/wycena" className="btn btn-primary btn-sm">
                {t.nav.cta} <ArrowUpRight size={16} className="btn-icon" aria-hidden="true" />
              </Link>
            </Magnetic>
            <button
              type="button"
              className="grid size-11 place-items-center rounded-full border border-line lg:hidden"
              aria-expanded={mobileOpen}
              aria-controls="menu-mobilne"
              aria-label={mobileOpen ? t.nav.menuClose : t.nav.menuOpen}
              onClick={() => setMobileOpen((v) => !v)}
            >
              {mobileOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div id="menu-mobilne" className="mobile-menu lg:hidden">
          <nav aria-label="Menu mobilne" className="container-v pb-10 pt-6">
            <ul className="grid gap-1">
              {mainLinks.map((l, i) => (
                <li key={l.href} className="m-item" style={{ "--i": i } as CSSProperties}>
                  <Link href={l.href} className="block py-1.5 text-[2.4rem] font-extrabold leading-tight tracking-[-0.04em]">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
            <p className="m-item t-small t-faint mt-8 font-semibold" style={{ "--i": 7 } as CSSProperties}>{t.nav.services}</p>
            <ul className="mt-2 grid gap-0.5 sm:grid-cols-2">
              {services.map((s, i) => (
                <li key={s.slug} className="m-item" style={{ "--i": 8 + i } as CSSProperties}>
                  <Link href={`/uslugi/${s.slug}`} className="flex items-center gap-3 py-2.5 text-[1.02rem] font-medium">
                    <span className="text-accent-text"><ServiceIcon name={s.icon} size={18} /></span>
                    {s.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="m-item mt-8 grid gap-2 sm:grid-cols-3" style={{ "--i": 20 } as CSSProperties}>
              <Link href="/wycena" className="btn btn-primary">{t.nav.cta}</Link>
              <Link href="/logowanie" className="btn btn-outline">{t.nav.login}</Link>
              <Link href="/rejestracja" className="btn btn-outline">{t.nav.register}</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
