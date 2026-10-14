import type { DemoProject } from "@/lib/catalog/types";

/** Abstrakcyjne kompozycje zamiast zdjęć stockowych — każda inna, w kolorach marki. */
function Motif({ kind }: { kind: DemoProject["motif"] }) {
  if (kind === "grid") {
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, r) =>
          Array.from({ length: 10 }).map((__, c) => (
            <rect
              key={`${r}-${c}`}
              x={18 + c * 30}
              y={18 + r * 30}
              width="20"
              height="20"
              rx="4"
              fill={r * 10 + c === 37 ? "var(--accent)" : "var(--line-strong)"}
              opacity={r * 10 + c === 37 ? 1 : 0.55}
            />
          )),
        )}
      </svg>
    );
  }
  if (kind === "stack") {
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={40 + i * 18} y={30 + i * 26} width="200" height="54" rx="10" fill="var(--surface)" stroke={i === 3 ? "var(--accent)" : "var(--line-strong)"} strokeWidth={i === 3 ? 2 : 1} />
        ))}
        <circle cx="280" cy="152" r="9" fill="var(--accent)" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          d={`M0 ${70 + i * 22} C 80 ${30 + i * 22}, 160 ${130 + i * 18}, 320 ${60 + i * 24}`}
          fill="none"
          stroke={i === 2 ? "var(--accent)" : "var(--line-strong)"}
          strokeWidth={i === 2 ? 3 : 1.5}
        />
      ))}
    </svg>
  );
}

export function DemoProjects({ projects }: { projects: DemoProject[] }) {
  return (
    <ul className="mt-12 grid gap-4 md:grid-cols-3">
      {projects.map((p) => (
        <li key={p.slug} className="flex flex-col overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface">
          <div className="aspect-[16/10] bg-surface-2">
            <Motif kind={p.motif} />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <div className="flex flex-wrap gap-2">
              <span className="tag tag-accent">Projekt demonstracyjny</span>
              <span className="tag">{p.kind}</span>
            </div>
            <h3 className="mt-4 text-lg font-bold leading-snug tracking-tight">{p.title}</h3>
            <p className="t-small t-muted mt-2">{p.brief}</p>
            <ul className="t-small mt-4 grid gap-1 text-ink-2">
              {p.scope.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ul>
  );
}
