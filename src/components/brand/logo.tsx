import Link from "next/link";

/**
 * Znak VELIO: dwa ramiona litery V, które zbiegają się w jednym punkcie.
 * Lewe ramię w kolorze tekstu, prawe w akcencie — kanały marketingu zbiegające się w jeden wynik.
 */
export function VelioMark({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <path d="M2 5h6.6L16 20.6V28L2 5Z" fill="currentColor" />
      <path d="M30 5h-6.6L16 20.6V28L30 5Z" fill="var(--accent)" />
    </svg>
  );
}

export function Logo({ href = "/", size = "md" }: { href?: string; size?: "md" | "lg" }) {
  const mark = size === "lg" ? 34 : 26;
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 text-ink" aria-label="VELIO — strona główna">
      <VelioMark size={mark} />
      <span
        className={size === "lg" ? "text-[1.7rem]" : "text-[1.32rem]"}
        style={{ fontWeight: 800, letterSpacing: "-0.055em", lineHeight: 1 }}
      >
        VELIO
      </span>
    </Link>
  );
}
