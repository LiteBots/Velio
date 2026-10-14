"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Jeden obserwator dla całej strony: dodaje klasę .is-in elementom z [data-reveal]
 * (oraz wykresom .demo-chart), gdy wejdą w ekran. Działa też po nawigacji klienta
 * i dla elementów dodanych później (MutationObserver).
 */
const SELECTOR = "[data-reveal]:not(.is-in), .demo-chart:not(.is-in), [data-count]:not(.is-in)";

export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const all = () => Array.from(document.querySelectorAll<HTMLElement>(SELECTOR));

    if (reduced || !("IntersectionObserver" in window)) {
      all().forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    all().forEach((el) => io.observe(el));

    const mo = new MutationObserver(() => all().forEach((el) => io.observe(el)));
    mo.observe(document.body, { childList: true, subtree: true });

    // zabezpieczenie: gdyby coś nie zostało odsłonięte (np. bardzo wysoki element), pokaż po 4 s
    const safety = window.setTimeout(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]:not(.is-in)").forEach((el) => {
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight) el.classList.add("is-in");
      });
    }, 4000);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearTimeout(safety);
    };
  }, [pathname]);

  return null;
}
