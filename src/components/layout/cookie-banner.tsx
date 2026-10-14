"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CONSENT_EVENT, readConsent, writeConsent } from "@/lib/consent";

export function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(readConsent() === null);
    const onChange = () => setVisible(false);
    window.addEventListener(CONSENT_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_EVENT, onChange);
  }, []);

  if (!visible || pathname === "/cookies") return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Ustawienia prywatności"
      className="enter fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-[720px] rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-pop)] sm:inset-x-6 sm:bottom-6 sm:p-6"
    >
      <p className="font-semibold">Twoja prywatność</p>
      <p className="t-small t-muted mt-1.5">
        Używamy niezbędnych plików cookies, żeby strona działała i zapamiętała Twoje ustawienia. Analityki i narzędzi marketingowych użyjemy tylko za Twoją zgodą.{" "}
        <Link href="/polityka-prywatnosci" className="link-u">Polityka prywatności</Link>
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ink btn-sm" onClick={() => writeConsent({ analytics: true, marketing: true })}>
          Akceptuję wszystkie
        </button>
        <button type="button" className="btn btn-outline btn-sm" onClick={() => writeConsent({ analytics: false, marketing: false })}>
          Tylko niezbędne
        </button>
        <Link href="/cookies" className="btn btn-ghost btn-sm">
          Wybierz kategorie
        </Link>
      </div>
    </div>
  );
}
