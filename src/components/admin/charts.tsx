import type { CSSProperties } from "react";

/**
 * Proste wykresy SVG renderowane po stronie serwera (bez dodatkowych bibliotek).
 * Słupki i linie animują się przy pierwszym wyświetleniu (CSS), wartości są w <title> dla czytników.
 */

const shortDay = (iso: string) => {
  const [, m, d] = iso.split("-");
  return `${Number(d)}.${m}`;
};
const monthNames = ["sty", "lut", "mar", "kwi", "maj", "cze", "lip", "sie", "wrz", "paź", "lis", "gru"];
const shortMonth = (ym: string) => monthNames[Number(ym.split("-")[1]) - 1] ?? ym;

export function DailyBars({ data, label }: { data: { date: string; count: number }[]; label: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const W = 600;
  const H = 180;
  const bw = W / data.length;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H + 24}`} className="adm-chart h-auto w-full" role="img" aria-label={label}>
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="var(--line)" strokeDasharray="3 6" />
        ))}
        {data.map((d, i) => {
          const h = (d.count / max) * (H - 8);
          return (
            <g key={d.date}>
              <rect
                className="adm-bar"
                x={i * bw + bw * 0.18}
                y={H - h}
                width={bw * 0.64}
                height={Math.max(h, d.count ? 2 : 0)}
                rx="3"
                fill={i === data.length - 1 ? "var(--accent)" : "color-mix(in srgb, var(--accent) 55%, var(--surface-2))"}
                style={{ "--i": i } as CSSProperties}
              >
                <title>{`${shortDay(d.date)}: ${d.count}`}</title>
              </rect>
              {i % 5 === 0 && (
                <text x={i * bw + bw / 2} y={H + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
                  {shortDay(d.date)}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </figure>
  );
}

export function MonthlyLine({ data, label }: { data: { month: string; value: number }[]; label: string }) {
  const W = 600;
  const H = 180;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = W / (data.length - 1 || 1);
  const pts = data.map((d, i) => [i * step, H - (d.value / max) * (H - 16) - 4] as const);
  const path = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const area = `${path} L${W} ${H} L0 ${H} Z`;
  return (
    <svg viewBox={`-8 0 ${W + 16} ${H + 24}`} className="adm-chart h-auto w-full" role="img" aria-label={label}>
      <defs>
        <linearGradient id="adm-area" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.35" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1="0" x2={W} y1={H - H * f} y2={H - H * f} stroke="var(--line)" strokeDasharray="3 6" />
      ))}
      <path d={area} fill="url(#adm-area)" className="adm-area" />
      <path d={path} pathLength={1} className="adm-line" fill="none" stroke="var(--accent)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {pts.map(([x, y], i) => (
        <g key={data[i].month}>
          <circle cx={x} cy={y} r="4" fill="var(--bg)" stroke="var(--accent)" strokeWidth="2">
            <title>{`${shortMonth(data[i].month)}: ${data[i].value.toLocaleString("pl-PL")} zł`}</title>
          </circle>
          <text x={x} y={H + 18} textAnchor="middle" fontSize="11" fill="var(--ink-3)">
            {shortMonth(data[i].month)}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Poziome paski z etykietą i liczbą (rozkład kategorii). */
export function BarList({ items, total, color }: { items: { label: string; count: number; tone?: string }[]; total?: number; color?: string }) {
  const max = Math.max(1, ...items.map((i) => i.count));
  const sum = total ?? items.reduce((a, b) => a + b.count, 0);
  if (items.length === 0) return <p className="t-small t-faint">Brak danych.</p>;
  return (
    <ul className="grid gap-3">
      {items.map((it, i) => (
        <li key={it.label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="flex items-center gap-2">
              {it.tone && <span className="size-2 rounded-full" style={{ background: it.tone }} />}
              {it.label}
            </span>
            <span className="tabular-nums text-ink-2">
              {it.count}
              <span className="ml-1.5 text-ink-3">{sum ? Math.round((it.count / sum) * 100) : 0}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-2">
            <div
              className="adm-hbar h-full rounded-full"
              style={{ width: `${(it.count / max) * 100}%`, background: it.tone ?? color ?? "var(--accent)", "--i": i } as CSSProperties}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Lejek sprzedaży: etapy jako zwężające się paski. */
export function Funnel({ stages }: { stages: { label: string; count: number; tone: string }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  return (
    <ol className="grid gap-2">
      {stages.map((s, i) => (
        <li key={s.label} className="grid grid-cols-[130px_1fr_40px] items-center gap-3 text-sm">
          <span className="truncate text-ink-2">{s.label}</span>
          <span className="relative h-7 overflow-hidden rounded-md bg-surface-2">
            <span
              className="adm-hbar absolute inset-y-0 left-0 rounded-md"
              style={{ width: `${Math.max(2, (s.count / max) * 100)}%`, background: s.tone, "--i": i } as CSSProperties}
            />
          </span>
          <span className="text-right font-semibold tabular-nums">{s.count}</span>
        </li>
      ))}
    </ol>
  );
}
