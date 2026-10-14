import type { CSSProperties, ElementType } from "react";

/**
 * Nagłówek odsłaniany linia po linii. Każda linia jest maskowana i wjeżdża od dołu.
 * mode="load"   — animacja przy załadowaniu strony (hero),
 * mode="scroll" — animacja, gdy nagłówek wejdzie w ekran.
 */
export function Lines({
  lines,
  as: Tag = "h2",
  className = "",
  mode = "scroll",
  delay = 0,
  id,
}: {
  lines: string[];
  as?: ElementType;
  className?: string;
  mode?: "load" | "scroll";
  delay?: number;
  id?: string;
}) {
  return (
    <Tag
      id={id}
      className={`${className} ${mode === "load" ? "load-lines" : ""}`}
      data-reveal={mode === "scroll" ? "lines" : undefined}
      style={{ "--d": `${delay}s` } as CSSProperties}
      aria-label={lines.join(" ")}
    >
      {lines.map((l, i) => (
        <span key={i} className="line-mask" aria-hidden="true">
          <span style={{ "--li": i } as CSSProperties}>{l}</span>
        </span>
      ))}
    </Tag>
  );
}
