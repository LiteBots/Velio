import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";
import type { CSSProperties, ReactNode } from "react";
import { Magnetic } from "@/components/motion/interactive";
import type { FaqItem, PricingMode } from "@/lib/catalog/types";
import { formatPLN, vatLabel } from "@/lib/config";
import { Breadcrumbs, type Crumb } from "./breadcrumbs";

/** Nagłówek podstrony: poświata w tle, breadcrumbs, duży H1 odsłaniany przy wejściu. */
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
    <section className="relative isolate overflow-hidden">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-[15vw] -top-[20vw] -z-10 size-[55vw] rounded-full opacity-40 blur-[100px]"
        style={{ background: "radial-gradient(circle, var(--accent) 0%, transparent 65%)" }}
      />
      <div className="container-v pb-16 pt-10 md:pb-24 md:pt-16">
        <div className="load-in" style={{ "--d": "0s" } as CSSProperties}>
          <Breadcrumbs items={crumbs} />
        </div>
        <h1 className="t-h1 load-in mt-10 max-w-[15ch]" style={{ "--d": "0.08s" } as CSSProperties}>
          {title}
        </h1>
        {lead && (
          <p className="t-lead load-in mt-7" style={{ "--d": "0.18s" } as CSSProperties}>
            {lead}
          </p>
        )}
        {children && (
          <div className="load-in mt-9" style={{ "--d": "0.26s" } as CSSProperties}>
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function Price({ pricing }: { pricing: PricingMode }) {
  if (pricing.kind === "from") {
    return (
      <div>
        <p className="text-[2.4rem] font-extrabold leading-none tracking-[-0.045em]">
          <span className="t-faint mr-1.5 text-base font-medium tracking-normal">od</span>
          {formatPLN(pricing.amount)}
        </p>
        <p className="t-small t-faint mt-2">
          {pricing.unit && pricing.unit !== "netto" ? `${pricing.unit}, ` : ""}
          {vatLabel()}
        </p>
      </div>
    );
  }
  return <p className="text-[1.8rem] font-extrabold leading-tight tracking-[-0.035em]">Wycena indywidualna</p>;
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
      {items.map((f, i) => (
        <details key={f.q} className="faq-item" data-reveal style={{ "--d": `${Math.min(i, 6) * 0.05}s` } as CSSProperties}>
          <summary>
            <H className="m-0 text-inherit [font:inherit]">{f.q}</H>
            <Plus className="faq-icon" aria-hidden="true" />
          </summary>
          <p className="faq-answer">{f.a}</p>
        </details>
      ))}
      {withSchema && items.length > 0 && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </div>
  );
}

/** Zamykający blok CTA: ogromna typografia, poświata i magnetyczny przycisk. */
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
    <section className="relative isolate overflow-hidden border-t border-line">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-full -z-10 h-[70vw] w-[110vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-[120px]"
        style={{ background: "radial-gradient(closest-side, var(--accent), transparent)" }}
      />
      <div className="container-v grid items-end gap-12 py-24 md:py-36 lg:grid-cols-[1fr_auto]">
        <div>
          <p className="kicker" data-reveal>Następny krok</p>
          <h2 className="t-display mt-6 max-w-[14ch]" data-reveal style={{ "--d": "0.08s" } as CSSProperties}>
            {title}
          </h2>
          <p className="t-lead mt-7" data-reveal style={{ "--d": "0.16s" } as CSSProperties}>
            {text}
          </p>
          {secondary && (
            <div className="mt-9" data-reveal style={{ "--d": "0.22s" } as CSSProperties}>
              <Link href={secondary.href} className="btn btn-outline btn-lg">
                {secondary.label}
              </Link>
            </div>
          )}
        </div>
        <div data-reveal="scale" style={{ "--d": "0.2s" } as CSSProperties}>
          <Magnetic strength={0.4}>
            <Link href={primary.href} className="cta-orb" data-cursor>
              <span className="px-4">
                {primary.label}
                <ArrowUpRight size={24} className="mx-auto mt-1.5" aria-hidden="true" />
              </span>
            </Link>
          </Magnetic>
        </div>
      </div>
    </section>
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
