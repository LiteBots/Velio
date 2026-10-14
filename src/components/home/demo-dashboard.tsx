import type { CSSProperties } from "react";

/**
 * Przykładowy widok raportu z panelu klienta. Dane są demonstracyjne i tak opisane na ekranie —
 * pokazują, jak będzie wyglądał raport, a nie wyniki żadnego klienta.
 */
const bars = [38, 52, 44, 61, 58, 72, 66, 84, 79, 92, 88, 100];
const linePts = [
  [0, 150],
  [50, 132],
  [100, 140],
  [150, 108],
  [200, 116],
  [250, 82],
  [300, 90],
  [350, 56],
  [400, 40],
];

export function DemoDashboard() {
  const path = linePts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const area = `${path} L400 190 L0 190 Z`;
  return (
    <div className="card-v overflow-hidden p-5 shadow-[var(--shadow-pop)] sm:p-7" data-reveal="scale">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="t-small t-faint ml-3">Panel klienta, raport</span>
        </div>
        <span className="tag tag-accent">Dane demonstracyjne</span>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {[
          { k: "Zapytania", v: "przykład", d: "z formularzy i telefonów" },
          { k: "Źródło", v: "per kanał", d: "SEO, reklamy, polecenia" },
          { k: "Koszt zapytania", v: "w zł", d: "budżet / liczba leadów" },
        ].map((s) => (
          <div key={s.k} className="rounded-[var(--radius)] border border-line bg-bg-2 p-4">
            <p className="t-small t-faint">{s.k}</p>
            <p className="mt-1 text-xl font-bold tracking-tight">{s.v}</p>
            <p className="t-small t-faint mt-1">{s.d}</p>
          </div>
        ))}
      </div>

      <div className="demo-chart mt-6 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[var(--radius)] border border-line bg-bg-2 p-4">
          <p className="t-small t-faint">Zapytania w czasie</p>
          <svg viewBox="0 0 400 190" className="mt-3 h-auto w-full" aria-hidden="true">
            <defs>
              <linearGradient id="dd-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
                <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {[40, 90, 140].map((y) => (
              <line key={y} x1="0" x2="400" y1={y} y2={y} stroke="var(--line)" strokeDasharray="3 6" />
            ))}
            <path className="area" d={area} fill="url(#dd-area)" />
            <path className="line" d={path} pathLength={1} fill="none" stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            {linePts.map(([x, y], i) => (
              <circle key={i} className="pt" cx={x} cy={y} r="4.5" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.5" style={{ "--i": i } as CSSProperties} />
            ))}
          </svg>
        </div>
        <div className="rounded-[var(--radius)] border border-line bg-bg-2 p-4">
          <p className="t-small t-faint">Zapytania wg miesiąca</p>
          <svg viewBox="0 0 240 190" className="mt-3 h-auto w-full" aria-hidden="true">
            {bars.map((b, i) => (
              <rect
                key={i}
                className="bar"
                x={i * 20 + 3}
                y={190 - b * 1.7}
                width="13"
                height={b * 1.7}
                rx="4"
                fill={i === bars.length - 1 ? "var(--accent)" : "var(--line-strong)"}
                style={{ "--i": i } as CSSProperties}
              />
            ))}
          </svg>
        </div>
      </div>
    </div>
  );
}
