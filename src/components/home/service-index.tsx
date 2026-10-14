"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ServiceIcon } from "@/components/ui/service-icon";

type Item = { slug: string; name: string; summary: string; icon: string; price: string };

/**
 * Lista usług w stylu indeksu agencji: duże nazwy, wypełnienie akcentem przy najechaniu
 * i karta podglądu podążająca za kursorem (tylko na urządzeniach z myszą).
 */
export function ServiceIndex({ items }: { items: Item[] }) {
  const preview = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<Item | null>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = preview.current;
    if (!el) return;
    let x = 0;
    let y = 0;
    let cx = 0;
    let cy = 0;
    let raf = 0;
    const move = (e: PointerEvent) => {
      x = e.clientX + 28;
      y = e.clientY - 40;
    };
    const loop = () => {
      cx += (x - cx) * 0.14;
      cy += (y - cy) * 0.14;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("pointermove", move);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div onPointerLeave={() => setActive(null)}>
      <ul className="border-t border-line">
        {items.map((s, i) => (
          <li key={s.slug} data-reveal style={{ "--d": `${(i % 4) * 0.05}s` } as CSSProperties}>
            <Link
              href={`/uslugi/${s.slug}`}
              className="svc-row"
              onPointerEnter={() => setActive(s)}
              onFocus={() => setActive(null)}
            >
              <span className="svc-name">{s.name}</span>
              <span className="svc-meta">
                <span className="hidden text-sm font-medium md:inline">{s.price}</span>
                <span className="svc-arrow">
                  <ArrowUpRight size={22} aria-hidden="true" />
                </span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {enabled && (
        <div ref={preview} className={`svc-preview ${active ? "is-on" : ""}`} aria-hidden="true">
          {active && (
            <>
              <span className="grid size-12 place-items-center rounded-2xl bg-accent text-white shadow-[0_0_30px_var(--accent-glow)]">
                <ServiceIcon name={active.icon} size={22} />
              </span>
              <p className="mt-5 text-lg font-bold leading-snug tracking-tight">{active.name}</p>
              <p className="t-small t-muted mt-2">{active.summary}</p>
              <p className="t-small mt-4 font-semibold text-accent-text">{active.price}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
