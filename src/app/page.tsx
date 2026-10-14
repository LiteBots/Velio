import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Convergence } from "@/components/home/convergence";
import { DemoProjects } from "@/components/home/demo-projects";
import { CtaBand, FaqList } from "@/components/ui/blocks";
import { PackageCard } from "@/components/ui/package-card";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getCatalog, getDemoProjects } from "@/lib/catalog/repository";

export const metadata = {
  alternates: { canonical: "/" },
};

const competences = [
  { name: "Digital & Web", text: "Strony, sklepy, UX" },
  { name: "Performance Marketing", text: "SEO, Google i Meta Ads" },
  { name: "AI & Automation", text: "Asystenci, integracje" },
  { name: "Branding & Creative", text: "Marka, druk, gadżety" },
  { name: "Growth & Sales", text: "Leady, CRM, ekspansja" },
];

const challenges = [
  {
    problem: "Firma nie pozyskuje wystarczającej liczby klientów.",
    answer: "Projektujemy lejek: od kanału, z którego przychodzą klienci, po moment wysłania zapytania.",
    href: "/uslugi/strategia-i-leady",
  },
  {
    problem: "Strona jest, ale nie generuje zapytań.",
    answer: "Przebudowujemy stronę wokół jednego celu i mierzymy, gdzie odwiedzający rezygnują.",
    href: "/uslugi/strony-internetowe",
  },
  {
    problem: "Reklamy kosztują, a wyników nie widać.",
    answer: "Zaczynamy od poprawnego pomiaru konwersji, a potem przesuwamy budżet tam, gdzie przynosi zapytania.",
    href: "/uslugi/reklamy-platne",
  },
  {
    problem: "Zespół traci godziny na ręczną pracę.",
    answer: "Automatyzujemy obsługę zapytań, raporty i przepisywanie danych między aplikacjami.",
    href: "/uslugi/ai-i-automatyzacje",
  },
  {
    problem: "Marka nie wyróżnia się na tle konkurencji.",
    answer: "Budujemy identyfikację na tym, co naprawdę odróżnia Cię od innych.",
    href: "/uslugi/branding",
  },
  {
    problem: "Nikt nie wie, które działania marketingowe działają.",
    answer: "Konfigurujemy analitykę i dashboard, który pokazuje koszt i źródło każdego zapytania.",
    href: "/uslugi/analityka-i-pomiar",
  },
];

const steps = [
  { title: "Analiza i poznanie biznesu", text: "Rozmowa, dostęp do danych, przegląd tego, co już działa." },
  { title: "Strategia i plan działania", text: "Cele, priorytety, zakres, harmonogram i budżet na piśmie." },
  { title: "Realizacja", text: "Projektujemy i budujemy w krótkich etapach z Twoją akceptacją." },
  { title: "Wdrożenie i uruchomienie", text: "Testy, publikacja, szkolenie zespołu i dokumentacja." },
  { title: "Optymalizacja i rozwój", text: "Mierzymy wyniki i poprawiamy to, co ma największy wpływ." },
];

const reasons = [
  { title: "Jeden partner, wiele obszarów", text: "Strona, kampanie, automatyzacje i marka projektowane razem, a nie przez pięć firm, które się nie znają." },
  { title: "Przejrzysty proces", text: "Wiesz, co robimy w tym tygodniu, co jest do akceptacji i ile to kosztuje." },
  { title: "Mierzalne cele", text: "Ustalamy wskaźniki przed startem. Raportujemy dane z podanym źródłem i zakresem dat." },
  { title: "Technologia, która rośnie z firmą", text: "Budujemy rozwiązania, które można rozbudować o kolejne kanały, procesy i rynki." },
];

export default async function HomePage() {
  const { services, packages, faqs } = await getCatalog();
  const starters = packages.filter((p) => p.priceFrom !== null).slice(0, 3);
  const demo = getDemoProjects();

  return (
    <>
      {/* ───────── Hero ───────── */}
      <section className="container-v grid items-center gap-12 pb-16 pt-12 md:pt-20 lg:grid-cols-[1.15fr_1fr] lg:gap-8 lg:pb-24">
        <div>
          <h1 className="t-display enter">Marketing, który napędza rozwój.</h1>
          <p className="t-lead enter mt-7" style={{ "--d": "0.1s" } as CSSProperties}>
            Strategia, technologia i kreatywność połączone w jeden system pozyskiwania klientów.
          </p>
          <div className="enter mt-9 flex flex-wrap gap-3" style={{ "--d": "0.2s" } as CSSProperties}>
            <Link href="#uslugi" className="btn btn-ink btn-lg">Poznaj nasze możliwości</Link>
            <Link href="/wycena" className="btn btn-outline btn-lg">Porozmawiajmy o Twoim biznesie</Link>
          </div>
        </div>
        <div className="lg:pl-6">
          <Convergence />
        </div>
      </section>

      {/* ───────── Kompetencje ───────── */}
      <section aria-label="Obszary kompetencji" className="border-y border-line">
        <ul className="container-v grid grid-cols-2 md:grid-cols-5">
          {competences.map((c, i) => (
            <li
              key={c.name}
              className={`py-6 pr-4 md:py-8 ${i > 0 ? "md:border-l md:border-line md:pl-6" : ""} ${
                i % 2 === 1 ? "border-l border-line pl-4 md:pl-6" : ""
              } ${i >= 2 ? "border-t border-line md:border-t-0" : ""}`}
            >
              <p className="font-bold tracking-tight">{c.name}</p>
              <p className="t-small t-faint mt-1">{c.text}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Wyzwania ───────── */}
      <section className="section container-v grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--header-h)+40px)] lg:self-start">
          <h2 className="t-h2">Z tym przychodzą do nas firmy.</h2>
          <p className="t-muted mt-5 max-w-md">
            Rzadko chodzi o „nową stronę” albo „więcej reklam”. Zwykle chodzi o to, że coś w drodze od pierwszego kontaktu do sprzedaży nie działa.
          </p>
        </div>
        <ul>
          {challenges.map((c) => (
            <li key={c.problem} className="border-t border-line last:border-b">
              <Link href={c.href} className="group grid gap-2 py-7 md:grid-cols-[1fr_1fr] md:gap-10">
                <p className="text-xl font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent-text">
                  {c.problem}
                </p>
                <p className="t-muted flex items-start justify-between gap-4">
                  <span>{c.answer}</span>
                  <ArrowUpRight size={20} className="mt-0.5 shrink-0 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent" aria-hidden="true" />
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Usługi ───────── */}
      <section id="uslugi" className="bg-surface section">
        <div className="container-v">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="t-h2 max-w-[14ch]">Dwanaście usług, jeden plan.</h2>
            <p className="t-muted max-w-md">
              Możesz zacząć od jednej usługi. Gdy będzie trzeba, kolejne dołączą do tego samego systemu — bez zaczynania od nowa.
            </p>
          </div>
          <ul className="mt-14 grid border-t border-line md:grid-cols-2 md:gap-x-12">
            {services.map((s) => (
              <li key={s.slug} className="border-b border-line">
                <Link href={`/uslugi/${s.slug}`} className="group flex items-start gap-5 py-6">
                  <span className="mt-1 grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                    <ServiceIcon name={s.icon} size={20} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[1.18rem] font-bold tracking-tight">{s.name}</span>
                    <span className="t-muted mt-1 block text-[0.95rem]">{s.summary}</span>
                  </span>
                  <ArrowUpRight size={20} className="mt-1.5 shrink-0 text-ink-3 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───────── Proces ───────── */}
      <section className="section container-v">
        <h2 className="t-h2 max-w-[18ch]">Jak pracujemy</h2>
        <p className="t-muted mt-5 max-w-xl">Pięć etapów, w tej samej kolejności przy każdym projekcie. Na końcu każdego wiesz, co dostałeś i co dalej.</p>
        <ol className="mt-14 grid gap-10 md:grid-cols-5 md:gap-6">
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-ink text-sm font-bold text-bg">{i + 1}</span>
                {i < steps.length - 1 && <span className="hidden h-px flex-1 bg-line-strong md:block" aria-hidden="true" />}
              </div>
              <h3 className="mt-5 text-lg font-bold leading-snug tracking-tight">{s.title}</h3>
              <p className="t-small t-muted mt-2">{s.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───────── Pakiety ───────── */}
      <section className="section border-t border-line">
        <div className="container-v">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <h2 className="t-h2 max-w-[15ch]">Pakiety na dobry początek</h2>
            <Link href="/pakiety" className="link-u">Porównaj wszystkie pakiety</Link>
          </div>
          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {starters.map((p) => (
              <PackageCard key={p.slug} pkg={p} compact />
            ))}
          </div>
          <div className="mt-4 flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-dashed border-line-strong p-7 md:flex-row md:items-center">
            <div>
              <p className="text-lg font-bold tracking-tight">Większy zakres? GROWTH i CUSTOM / ENTERPRISE</p>
              <p className="t-muted t-small mt-1">Rozbudowane wdrożenia, wiele procesów i rynków — z indywidualną wyceną.</p>
            </div>
            <Link href="/wycena" className="btn btn-outline shrink-0">Poproś o indywidualną wycenę</Link>
          </div>
        </div>
      </section>

      {/* ───────── Dlaczego VELIO ───────── */}
      <section className="section bg-surface">
        <div className="container-v grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <h2 className="t-h2 max-w-[13ch]">Dlaczego firmy wybierają VELIO</h2>
          <dl className="grid border-t border-line sm:grid-cols-2">
            {reasons.map((r, i) => (
              <div
                key={r.title}
                className={`border-b border-line py-7 ${i % 2 === 1 ? "sm:border-l sm:pl-8" : "sm:pr-8"}`}
              >
                <dt className="text-lg font-bold tracking-tight">{r.title}</dt>
                <dd className="t-muted mt-2">{r.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ───────── Realizacje ───────── */}
      <section className="section container-v">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <h2 className="t-h2">Realizacje</h2>
            <p className="t-muted mt-4 max-w-xl">
              Poniżej projekty demonstracyjne pokazujące typowy zakres prac. Nie są to realizacje dla klientów i nie podajemy przy nich wyników.
            </p>
          </div>
          <Link href="/realizacje" className="link-u shrink-0">Wszystkie projekty</Link>
        </div>
        <DemoProjects projects={demo} />
      </section>

      {/* ───────── FAQ ───────── */}
      <section className="section-tight container-v grid gap-10 pb-24 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <h2 className="t-h2">Pytania przed rozpoczęciem</h2>
          <p className="t-muted mt-5">
            Nie znalazłeś odpowiedzi? <Link href="/faq" className="link-u">Zobacz wszystkie pytania</Link> albo{" "}
            <Link href="/kontakt" className="link-u">napisz do nas</Link>.
          </p>
        </div>
        <FaqList items={faqs.slice(0, 6)} />
      </section>

      <CtaBand />
    </>
  );
}
