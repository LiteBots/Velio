import type { Metadata } from "next";
import { QuoteWizard, type WizardVariant } from "@/components/forms/quote-wizard";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getPackages, getServices } from "@/lib/catalog/repository";

export const metadata: Metadata = {
  title: "Bezpłatna konsultacja i wycena projektu",
  description: "Opisz potrzeby w kilku krokach. Odpowiemy z propozycją zakresu, harmonogramu i wyceny.",
  alternates: { canonical: "/wycena" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

const serviceToNeed: Record<string, string> = {
  "strony-internetowe": "strona",
  "pozycjonowanie-seo": "seo",
  "reklamy-platne": "reklamy",
  "ai-i-automatyzacje": "ai",
  branding: "branding",
  "druk-i-materialy": "druk",
  "odziez-i-gadzety": "druk",
  "email-marketing-i-crm": "crm",
  "strategia-i-leady": "crm",
};

const titles: Record<WizardVariant, { title: string; lead: string }> = {
  wycena: {
    title: "Bezpłatna konsultacja i wycena projektu",
    lead: "Sześć krótkich kroków. Większość pól jest opcjonalna — wypełnij tyle, ile wiesz, resztę ustalimy w rozmowie.",
  },
  druk: {
    title: "Zamówienie druku i materiałów",
    lead: "Podaj parametry produktu i termin. Każde zamówienie wyceniamy indywidualnie, bo cena zależy od nakładu, materiału i dostawcy.",
  },
  automatyzacje: {
    title: "Zapytanie o automatyzację",
    lead: "Opisz proces, który zajmuje dziś najwięcej czasu. Zaproponujemy, co i jak warto zautomatyzować.",
  },
  indywidualny: {
    title: "Projekt indywidualny",
    lead: "Rozbudowane wdrożenie, wiele procesów lub rynków? Opisz sytuację — przygotujemy plan i wycenę.",
  },
};

export default async function QuotePage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const formularz = one(sp.formularz);
  const pakiet = one(sp.pakiet);
  const usluga = one(sp.usluga);

  const [packages, services] = await Promise.all([getPackages(), getServices()]);
  const pkg = pakiet ? packages.find((p) => p.slug === pakiet) : undefined;
  const svc = usluga ? services.find((s) => s.slug === usluga) : undefined;

  let variant: WizardVariant = "wycena";
  if (formularz === "druk" || formularz === "automatyzacje" || formularz === "indywidualny") variant = formularz;
  else if (pkg?.slug === "custom") variant = "indywidualny";

  const preNeeds = svc && serviceToNeed[svc.slug] ? [serviceToNeed[svc.slug]] : [];
  const copy = titles[variant];

  return (
    <section className="container-v grid gap-12 pb-24 pt-10 md:pt-14 lg:grid-cols-[0.75fr_1.25fr] lg:gap-20">
      <div>
        <Breadcrumbs items={[{ name: "Wycena projektu", href: "/wycena" }]} />
        <h1 className="t-h1 mt-8">{copy.title}</h1>
        <p className="t-lead mt-6">{copy.lead}</p>
        <div className="t-small t-muted mt-10 grid gap-4 border-t border-line pt-8">
          <p><strong className="text-ink">Co dalej?</strong> Po wysłaniu dostaniesz numer zgłoszenia. Odezwiemy się z pytaniami albo propozycją krótkiej rozmowy.</p>
          <p><strong className="text-ink">Bez zobowiązań.</strong> Zgłoszenie nie jest zamówieniem. Zakres i cenę zawsze potwierdzasz osobno, po otrzymaniu wyceny.</p>
        </div>
      </div>
      <div className="lg:pt-2">
        <QuoteWizard
          key={`${variant}-${pkg?.slug ?? ""}-${svc?.slug ?? ""}`}
          variant={variant}
          packageSlug={pkg?.slug}
          packageName={pkg?.name}
          service={svc?.slug}
          serviceName={svc?.name}
          preNeeds={preNeeds}
        />
      </div>
    </section>
  );
}
