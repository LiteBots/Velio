"use client";

import { useEffect, useRef, type CSSProperties } from "react";

type Step = { title: string; text: string; detail: string };

/** Oś procesu: linia wypełnia się przy przewijaniu, a kolejne etapy „zapalają się”. */
export function ProcessTimeline({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".process-step"));
    let raf = 0;
    const update = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const mid = window.innerHeight * 0.6;
      const p = Math.max(0, Math.min(1, (mid - r.top) / r.height));
      el.style.setProperty("--p", String(p));
      for (const it of items) {
        const ir = it.getBoundingClientRect();
        it.classList.toggle("is-lit", ir.top + 28 < mid);
      }
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={root} className="process" style={{ "--p": 0 } as CSSProperties}>
      <div className="process-line" aria-hidden="true">
        <i />
      </div>
      <ol>
      {steps.map((s, i) => (
        <li key={s.title} className="process-step">
          <span className="process-dot" aria-hidden="true">{i + 1}</span>
          <div data-reveal>
            <h3 className="t-h3">
              <span className="sr-only">Etap {i + 1}: </span>
              {s.title}
            </h3>
            <p className="t-muted mt-2 max-w-xl">{s.text}</p>
            <p className="t-small t-faint mt-3">{s.detail}</p>
          </div>
        </li>
      ))}
      </ol>
    </div>
  );
}
