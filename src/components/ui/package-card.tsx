import Link from "next/link";
import { Check } from "lucide-react";
import type { Package } from "@/lib/catalog/types";
import { formatPLN, vatLabel } from "@/lib/config";

/**
 * Karta pakietu. Wyróżniony pakiet (featured) dostaje odwróconą powierzchnię — bez gradientów.
 * `compact` — wersja na stronę główną (bez limitów i dodatków).
 */
export function PackageCard({ pkg, compact = false }: { pkg: Package; compact?: boolean }) {
  const inverted = pkg.featured;
  return (
    <article
      id={pkg.slug}
      className={`flex h-full flex-col rounded-[var(--radius-lg)] p-7 md:p-8 ${
        inverted ? "bg-ink text-bg" : "border border-line bg-surface"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[1.35rem] font-extrabold tracking-[-0.03em]">{pkg.name}</h3>
        {pkg.featured && <span className="tag shrink-0 bg-accent text-white">Najczęściej wybierany</span>}
      </div>
      <p className={`t-small mt-3 ${inverted ? "opacity-75" : "t-muted"}`}>{pkg.audience}</p>

      <div className="mt-7">
        {pkg.priceFrom !== null ? (
          <>
            <p className="text-[2.5rem] font-extrabold leading-none tracking-[-0.04em]">
              <span className={`mr-1.5 text-base font-medium ${inverted ? "opacity-70" : "t-faint"}`}>od</span>
              {formatPLN(pkg.priceFrom)}
            </p>
            <p className={`t-small mt-2 ${inverted ? "opacity-70" : "t-faint"}`}>
              {pkg.priceUnit.replace(/^netto\s*/, "") ? `${pkg.priceUnit.replace(/^netto\s*/, "")}, ` : ""}
              {vatLabel()}
            </p>
          </>
        ) : (
          <p className="text-[1.9rem] font-extrabold leading-tight tracking-[-0.03em]">Wycena indywidualna</p>
        )}
      </div>

      {!compact && <p className={`mt-6 ${inverted ? "opacity-85" : "t-muted"}`}>{pkg.description}</p>}

      <ul className={`mt-7 grid gap-2.5 border-t pt-6 ${inverted ? "border-white/15 dark:border-black/15" : "border-line"}`}>
        {(compact ? pkg.includes.slice(0, 5) : pkg.includes).map((item) => (
          <li key={item} className="flex gap-2.5 text-[0.95rem] leading-snug">
            <Check size={17} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
            {item}
          </li>
        ))}
        {compact && pkg.includes.length > 5 && (
          <li className={`t-small pl-[27px] ${inverted ? "opacity-70" : "t-faint"}`}>i {pkg.includes.length - 5} więcej</li>
        )}
      </ul>

      {!compact && (
        <dl className={`t-small mt-6 grid gap-3 ${inverted ? "opacity-85" : "t-muted"}`}>
          <div>
            <dt className="font-semibold">Czas realizacji</dt>
            <dd>{pkg.duration}</dd>
          </div>
          {pkg.limits.length > 0 && (
            <div>
              <dt className="font-semibold">Ograniczenia</dt>
              <dd>{pkg.limits.join(". ")}.</dd>
            </div>
          )}
          {pkg.separateCosts && (
            <div>
              <dt className="font-semibold">Koszty osobne</dt>
              <dd>{pkg.separateCosts}</dd>
            </div>
          )}
          {pkg.extensions.length > 0 && (
            <div>
              <dt className="font-semibold">Możliwe rozszerzenia</dt>
              <dd>{pkg.extensions.join(", ")}</dd>
            </div>
          )}
          {pkg.addons.length > 0 && (
            <div>
              <dt className="font-semibold">Dodatki</dt>
              <dd>
                <ul>
                  {pkg.addons.map((a) => (
                    <li key={a.name}>
                      {a.name} — {a.note}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-8">
        <Link
          href={`/wycena?pakiet=${pkg.slug}`}
          className={`btn ${inverted ? "btn-primary" : "btn-ink"}`}
        >
          {pkg.priceFrom !== null ? "Wybieram pakiet" : "Opisz potrzeby"}
        </Link>
        <Link
          href={`/kontakt?pakiet=${pkg.slug}`}
          className={`btn ${inverted ? "border-white/30 text-bg hover:border-bg dark:border-black/25" : "btn-outline"}`}
        >
          Zapytaj o wycenę
        </Link>
      </div>
    </article>
  );
}
