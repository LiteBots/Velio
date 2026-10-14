"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { t } from "@/i18n/pl";

/** Przełącznik jasny/ciemny. Przed hydratacją renderuje neutralny przycisk, żeby uniknąć migotania ikony. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";
  const next = isDark ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      className={`grid size-10 place-items-center rounded-full text-ink transition-colors hover:bg-surface-2 ${className}`}
      aria-label={mounted ? `${t.theme.toggle}: włącz ${isDark ? "jasny" : "ciemny"}` : t.theme.toggle}
      title={t.theme.toggle}
    >
      {mounted ? (
        isDark ? <Sun size={19} strokeWidth={1.8} aria-hidden="true" /> : <Moon size={19} strokeWidth={1.8} aria-hidden="true" />
      ) : (
        <span className="size-[19px]" aria-hidden="true" />
      )}
    </button>
  );
}

/** Wersja z trzema opcjami (jasny / ciemny / systemowy) — do ustawień i stopki. */
export function ThemeSegmented() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const options = [
    { value: "light", label: t.theme.light },
    { value: "dark", label: t.theme.dark },
    { value: "system", label: t.theme.system },
  ];
  return (
    <div role="radiogroup" aria-label={t.theme.label} className="inline-flex rounded-full border border-line p-1">
      {options.map((o) => {
        const active = mounted && theme === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
              active ? "bg-ink text-bg" : "text-ink-2 hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
