import type { CSSProperties } from "react";

/**
 * Wizualizacja w hero: pięć kanałów zbiega się w jednym punkcie i wychodzi jedną linią w górę.
 * Razem tworzą literę V — znak marki. Animacja rysuje się raz po wejściu na stronę
 * (CSS, bez JavaScriptu); przy prefers-reduced-motion jest od razu narysowana.
 */
const streams = [
  { label: "Strona", y: 46 },
  { label: "SEO", y: 118 },
  { label: "Reklamy", y: 190 },
  { label: "Automatyzacje", y: 262 },
  { label: "Dane i CRM", y: 334 },
];

const VX = 318;
const VY = 392;
const TIP = { x: 560, y: 70 };

export function Convergence() {
  return (
    <svg
      viewBox="-6 0 606 430"
      className="converge h-auto w-full"
      role="img"
      aria-labelledby="converge-title"
    >
      <title id="converge-title">
        Strona, SEO, reklamy, automatyzacje oraz dane i CRM łączą się w jeden system, którego wynikiem jest wzrost firmy.
      </title>

      {[70, 160, 250, 340].map((y) => (
        <line key={y} className="grid-line" x1="0" x2="600" y1={y + 30} y2={y + 30} />
      ))}

      {streams.map((s, i) => (
        <g key={s.label} style={{ "--i": i } as CSSProperties}>
          <text className="label" x="0" y={s.y - 12}>
            {s.label}
          </text>
          <path
            className="stream"
            pathLength={1}
            style={{ "--len": 1 } as CSSProperties}
            d={`M0 ${s.y} L96 ${s.y} C ${196 + i * 6} ${s.y}, ${VX - 70} ${VY - 30 + i * 4}, ${VX} ${VY}`}
          />
          <circle className="node" cx="0" cy={s.y} r="3.5" fill="var(--ink)" />
        </g>
      ))}

      <path
        className="out"
        pathLength={1}
        style={{ "--len": 1 } as CSSProperties}
        d={`M${VX} ${VY} L${TIP.x} ${TIP.y}`}
      />

      <g className="tip">
        <circle cx={VX} cy={VY} r="6" fill="var(--bg)" stroke="var(--accent)" strokeWidth="3" />
        <circle cx={TIP.x} cy={TIP.y} r="22" fill="var(--accent)" opacity="0.14" />
        <circle cx={TIP.x} cy={TIP.y} r="8" fill="var(--accent)" />
        <text className="label label-strong" x={TIP.x - 16} y={TIP.y - 34} textAnchor="end">
          Wzrost firmy
        </text>
      </g>
    </svg>
  );
}
