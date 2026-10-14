import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/ui/blocks";
import { PackageCard } from "@/components/ui/package-card";
import { getPackages } from "@/lib/catalog/repository";
import { vatLabel } from "@/lib/config";

export const metadata: Metadata = {
  title: "Pakiety usług marketingowych — START, PIERWSI KLIENCI, AUTOMATYZACJA, GROWTH",
  description:
    "Gotowe pakiety dla firm na różnych etapach rozwoju: od prostej strony po rozbudowane wdrożenia z kampaniami, SEO i CRM. Ceny netto, jasny zakres.",
  alternates: { canonical: "/pakiety" },
};

export default async function PackagesPage() {
  const packages = await getPackages();
  const priced = packages.filter((p) => p.priceFrom !== null);
  const custom = packages.filter((p) => p.priceFrom === null);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Pakiety", href: "/pakiety" }]}
        title="Pakiety z jasno określonym zakresem."
        lead={`Każdy pakiet ma opisany zakres, ograniczenia i koszty, które rozliczamy osobno. Ceny podajemy ${vatLabel()}. Zamówienie zaczynasz bez zakładania konta.`}
      />

      <section className="container-v pb-10">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {priced.map((p) => (
            <PackageCard key={p.slug} pkg={p} />
          ))}
        </div>
      </section>

      {custom.map((p) => (
        <section key={p.slug} id={p.slug} className="container-v pb-20">
          <div className="grid gap-8 rounded-[var(--radius-lg)] border border-line bg-surface p-8 md:p-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
            <div>
              <h2 className="t-h2">{p.name}</h2>
              <p className="t-muted mt-4">{p.audience}</p>
              <p className="mt-4">{p.description}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                <Link href={`/wycena?pakiet=${p.slug}`} className="btn btn-ink btn-lg">Opisz potrzeby</Link>
                <Link href={`/kontakt?pakiet=${p.slug}`} className="btn btn-outline btn-lg">Zapytaj o wycenę</Link>
              </div>
            </div>
            <ul className="grid content-start gap-x-6 sm:grid-cols-2">
              {p.includes.map((i) => (
                <li key={i} className="border-b border-line py-3 font-medium">{i}</li>
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section className="container-v pb-20">
        <div className="grid gap-6 border-t border-line pt-10 md:grid-cols-3">
          <div>
            <h2 className="font-bold">Ceny „od”</h2>
            <p className="t-small t-muted mt-2">Podajemy cenę najprostszego wariantu. Ostateczną kwotę potwierdzamy w wycenie, zanim cokolwiek zaczniemy.</p>
          </div>
          <div>
            <h2 className="font-bold">Koszty zewnętrzne</h2>
            <p className="t-small t-muted mt-2">Budżet reklamowy i licencje narzędzi (np. CRM, AI) nie są częścią ceny pakietu — zawsze wykazujemy je oddzielnie.</p>
          </div>
          <div>
            <h2 className="font-bold">Rozszerzenia</h2>
            <p className="t-small t-muted mt-2">Każdy pakiet można rozbudować o dodatki albo połączyć ze stałą współpracą. <Link href="/abonamenty" className="link-u">Zobacz abonamenty</Link>.</p>
          </div>
        </div>
      </section>

      <CtaBand title="Żaden pakiet nie pasuje idealnie?" text="To normalne. Opisz sytuację, a przygotujemy zakres skrojony pod Twoją firmę." secondary={null} />
    </>
  );
}
