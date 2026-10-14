import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import { TiltCard } from "@/components/motion/interactive";
import type { Package } from "@/lib/catalog/types";
import { formatPLN, vatLabel } from "@/lib/config";

/**
 * Karta pakietu z efektem 3D i świecącą krawędzią przy kursorze.
 * Wyróżniony pakiet ma tło w kolorze akcentu. `compact` — wersja na stronę główną.
 */
export function PackageCard({ pkg, compact = false }: { pkg: Package; compact?: boolean }) {
  const hi = pkg.featured;
  return (
    <TiltCard
      as="article"
      id={pkg.slug}
      max={5}
      className={`flex h-full flex-col rounded-[var(--radius-lg)] p-7 md:p-9 ${
        hi ? "bg-accent text-white shadow-[0_30px_80px_-30px_var(--accent-glow)]" : "card-v"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-[1.5rem] font-extrabold tracking-[-0.035em]">{pkg.name}</h3>
        {hi && <span className="tag shrink-0 border-white/25 bg-white/15 text-white">Najczęściej wybierany</span>}
      </div>
      <p className={`t-small mt-3 ${hi ? "text-white/80" : "t-muted"}`}>{pkg.audience}</p>

      <div className="mt-8">
        {pkg.priceFrom !== null ? (
          <>
            <p className="text-[3rem] font-extrabold leading-none tracking-[-0.055em]">
              <span className={`mr-1.5 text-base font-medium tracking-normal ${hi ? "text-white/70" : "t-faint"}`}>od</span>
              {formatPLN(pkg.priceFrom)}
            </p>
            <p className={`t-small mt-2 ${hi ? "text-white/70" : "t-faint"}`}>
              {pkg.priceUnit.replace(/^netto\s*/, "") ? `${pkg.priceUnit.replace(/^netto\s*/, "")}, ` : ""}
              {vatLabel()}
            </p>
          </>
        ) : (
          <p className="text-[2rem] font-extrabold leading-tight tracking-[-0.035em]">Wycena indywidualna</p>
        )}
      </div>

      {!compact && <p className={`mt-6 ${hi ? "text-white/90" : "t-muted"}`}>{pkg.description}</p>}

      <ul className={`mt-8 grid gap-3 border-t pt-7 ${hi ? "border-white/20" : "border-line"}`}>
        {(compact ? pkg.includes.slice(0, 5) : pkg.includes).map((item) => (
          <li key={item} className="flex gap-3 text-[0.96rem] leading-snug">
            <span className={`mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ${hi ? "bg-white text-accent" : "bg-accent-soft text-accent-text"}`}>
              <Check size={12} strokeWidth={3} aria-hidden="true" />
            </span>
            {item}
          </li>
        ))}
        {compact && pkg.includes.length > 5 && (
          <li className={`t-small pl-8 ${hi ? "text-white/70" : "t-faint"}`}>i {pkg.includes.length - 5} więcej</li>
        )}
      </ul>

      {!compact && (
        <dl className={`t-small mt-7 grid gap-3 ${hi ? "text-white/85" : "t-muted"}`}>
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
                    <li key={a.name}>{a.name}, {a.note}</li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
      )}

      <div className="mt-auto flex flex-wrap gap-2 pt-9">
        <Link
          href={`/wycena?pakiet=${pkg.slug}`}
          className={`btn ${hi ? "bg-white text-[#111216] before:bg-[#111216] hover:text-white" : "btn-primary"}`}
        >
          {pkg.priceFrom !== null ? "Wybieram pakiet" : "Opisz potrzeby"}
          <ArrowUpRight size={17} className="btn-icon" aria-hidden="true" />
        </Link>
        <Link
          href={`/kontakt?pakiet=${pkg.slug}`}
          className={`btn ${hi ? "border-white/40 text-white before:bg-white hover:text-accent" : "btn-outline"}`}
        >
          Zapytaj o wycenę
        </Link>
      </div>
    </TiltCard>
  );
}
