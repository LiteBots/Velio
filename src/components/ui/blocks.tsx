import Link from "next/link";
import { Plus } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import type { FaqItem, PricingMode } from "@/lib/catalog/types";
import { formatPLN, vatLabel } from "@/lib/config";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** Nagłówek podstrony: breadcrumbs, H1, lead. */
export function PageHero({
  crumbs,
  title,
  lead,
  children,
}: {
  crumbs: Crumb[];
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="container-v pb-14 pt-10 md:pb-20 md:pt-14">
      <Breadcrumbs items={crumbs} />
      <h1 className="t-h1 enter mt-8 max-w-[16ch]">{title}</h1>
      {lead && (
        <p className="t-lead enter mt-6" style={{ "--d": "0.08s" } as CSSProperties}>
          {lead}
        </p>
      )}
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}

export function Price({ pricing }: { pricing: PricingMode }) {
  if (pricing.kind === "from") {
    return (
      <div>
        <p className="text-[2rem] font-bold leading-none tracking-tight">
          <span className="t-faint mr-1.5 text-base font-medium">od</span>
          {formatPLN(pricing.amount)}
        </p>
        <p className="t-small t-faint mt-2">{pricing.unit && pricing.unit !== "netto" ? `${pricing.unit}, ` : ""}{vatLabel()}</p>
      </div>
    );
  }
  return <p className="text-[1.6rem] font-bold leading-tight tracking-tight">Wycena indywidualna</p>;
}

export function FaqList({ items, headingLevel = 3, withSchema = true }: { items: FaqItem[]; headingLevel?: 2 | 3; withSchema?: boolean }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="border-t border-line">
      {items.map((f) => (
        <details key={f.q} className="faq-item">
          <summary>
            <H className="m-0 text-inherit [font:inherit]">{f.q}</H>
            <Plus size={20} className="faq-icon text-ink-3" aria-hidden="true" />
          </summary>
          <p className="faq-answer">{f.a}</p>
        </details>
      ))}
      {withSchema && items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </div>
  );
}

/** Zamykający blok CTA — jedyne miejsce, gdzie kolor akcentu wypełnia całą powierzchnię. */
export function CtaBand({
  title = "Porozmawiajmy o Twoim biznesie.",
  text = "Opisz, gdzie jesteś i dokąd chcesz dojść. W odpowiedzi zaproponujemy zakres, harmonogram i wycenę.",
  primary = { href: "/wycena", label: "Wyceń projekt" },
  secondary = { href: "/pakiety", label: "Zobacz pakiety" },
}: {
  title?: string;
  text?: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
}) {
  return (
    <section className="container-v pb-20 md:pb-28">
      <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-accent px-6 py-14 text-white sm:px-12 md:py-20">
        <CtaMark />
        <div className="relative max-w-2xl">
          <h2 className="t-h2">{title}</h2>
          <p className="mt-5 text-lg text-white/85">{text}</p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn btn-lg bg-white text-[#14151a] hover:bg-[#14151a] hover:text-white">
              {primary.label}
            </Link>
            {secondary && (
              <Link href={secondary.href} className="btn btn-lg border-white/40 text-white hover:border-white">
                {secondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function CtaMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      aria-hidden="true"
      className="pointer-events-none absolute -bottom-16 -right-10 h-[420px] w-[420px] opacity-[0.16] md:-right-4"
    >
      <path d="M2 5h6.6L16 20.6V28L2 5Z" fill="#fff" />
      <path d="M30 5h-6.6L16 20.6V28L30 5Z" fill="#fff" />
    </svg>
  );
}

/** Ramka dla funkcji, które czekają na kolejny etap — nie udaje działającej funkcji. */
export function PendingNotice({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel p-6 md:p-8">
      <span className="tag tag-accent">W przygotowaniu</span>
      <h2 className="t-h3 mt-4">{title}</h2>
      <div className="t-muted mt-2 max-w-xl">{children}</div>
    </div>
  );
}
