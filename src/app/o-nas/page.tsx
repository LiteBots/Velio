import type { Metadata } from "next";
import { CtaBand, PageHero } from "@/components/ui/blocks";

export const metadata: Metadata = {
  title: "O nas",
  description: "VELIO to partner technologiczno-marketingowy. Łączymy strategię, technologię i kreatywność w jeden system pozyskiwania klientów.",
  alternates: { canonical: "/o-nas" },
};

const principles = [
  {
    title: "Najpierw cel, potem narzędzie",
    text: "Nie zaczynamy od pytania „jaka strona?” ani „ile na reklamy?”. Zaczynamy od tego, ilu klientów potrzebujesz i skąd mają przyjść.",
  },
  {
    title: "Mówimy, co jest w cenie",
    text: "Każda wycena ma rozpisany zakres, ograniczenia i koszty zewnętrzne. Bez gwiazdek drobnym drukiem.",
  },
  {
    title: "Dane z podanym źródłem",
    text: "W raportach pokazujemy, skąd pochodzi każda liczba i za jaki okres. Nie pokazujemy wyników, których nie da się sprawdzić.",
  },
  {
    title: "Budujemy, żeby rozwijać",
    text: "Strona, kampanie, CRM i automatyzacje są projektowane jako jeden system, który można rozbudowywać bez zaczynania od nowa.",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "O nas", href: "/o-nas" }]}
        title="Partner, nie podwykonawca."
        lead="VELIO pomaga firmom zdobywać klientów, budować rozpoznawalność, zwiększać sprzedaż i automatyzować codzienną pracę. Łączymy kompetencje, które zwykle są rozproszone między kilka agencji."
      />
      <section className="border-t border-line bg-surface">
        <div className="container-v grid gap-12 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="t-h2">Jak myślimy o pracy</h2>
          <dl className="grid border-t border-line">
            {principles.map((p) => (
              <div key={p.title} className="grid gap-2 border-b border-line py-7 md:grid-cols-[0.8fr_1.2fr] md:gap-10">
                <dt className="text-lg font-bold tracking-tight">{p.title}</dt>
                <dd className="t-muted">{p.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
      <section className="section-tight container-v">
        <h2 className="t-h2 max-w-[18ch]">Pięć obszarów, jeden zespół</h2>
        <p className="t-muted mt-5 max-w-2xl">
          Digital & Web, Performance Marketing, AI & Automation, Branding & Creative oraz Growth & Sales. Dzięki temu strona wie, co obiecuje reklama, a CRM wie, skąd przyszedł klient.
        </p>
      </section>
      <CtaBand />
    </>
  );
}
