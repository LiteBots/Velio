import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DemoDashboard } from "@/components/home/demo-dashboard";
import { DemoProjects } from "@/components/home/demo-projects";
import { ProcessTimeline } from "@/components/home/process-timeline";
import { ServiceIndex } from "@/components/home/service-index";
import { HeroField } from "@/components/motion/hero-field";
import { CountUp, Magnetic, TiltCard } from "@/components/motion/interactive";
import { Lines } from "@/components/motion/lines";
import { Marquee } from "@/components/motion/marquee";
import { CtaBand, FaqList } from "@/components/ui/blocks";
import { PackageCard } from "@/components/ui/package-card";
import { getCatalog, getDemoProjects } from "@/lib/catalog/repository";
import { formatPLN } from "@/lib/config";

export const metadata = {
  alternates: { canonical: "/" },
};

const competences = ["Digital & Web", "Performance Marketing", "AI & Automation", "Branding & Creative", "Growth & Sales"];

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
    answer: "Zaczynamy od poprawnego pomiaru konwersji, potem przesuwamy budżet tam, gdzie przynosi zapytania.",
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
    problem: "Nikt nie wie, które działania działają.",
    answer: "Konfigurujemy analitykę i dashboard, który pokazuje źródło i koszt każdego zapytania.",
    href: "/uslugi/analityka-i-pomiar",
  },
];

const steps = [
  { title: "Analiza i poznanie biznesu", text: "Rozmowa, dostęp do danych, przegląd tego, co już działa, a co blokuje sprzedaż.", detail: "Efekt: lista priorytetów i szybkich poprawek." },
  { title: "Strategia i plan działania", text: "Cele, kanały, zakres, harmonogram i budżet — spisane, zanim zaczniemy wydawać pieniądze.", detail: "Efekt: plan z mierzalnymi wskaźnikami." },
  { title: "Realizacja", text: "Projektujemy i budujemy w krótkich etapach. Każdy etap akceptujesz przed przejściem dalej.", detail: "Efekt: gotowe elementy do sprawdzenia na bieżąco." },
  { title: "Wdrożenie i uruchomienie", text: "Testy na prawdziwych urządzeniach, publikacja, szkolenie zespołu i dokumentacja.", detail: "Efekt: działające rozwiązanie i instrukcja." },
  { title: "Optymalizacja i rozwój", text: "Mierzymy wyniki i poprawiamy to, co ma największy wpływ na zapytania i sprzedaż.", detail: "Efekt: regularne raporty i plan kolejnych kroków." },
];

const reasons = [
  { title: "Jeden partner, wiele obszarów", text: "Strona, kampanie, automatyzacje i marka projektowane razem — nie przez pięć firm, które się nie znają." },
  { title: "Przejrzysty proces", text: "Wiesz, co robimy w tym tygodniu, co czeka na akceptację i ile to kosztuje." },
  { title: "Mierzalne cele", text: "Wskaźniki ustalamy przed startem. Raporty pokazują źródło danych i zakres dat." },
  { title: "Technologia, która rośnie z firmą", text: "Rozwiązania, które można rozbudować o kolejne kanały, procesy i rynki." },
];

export default async function HomePage() {
  const { services, packages, plans, faqs } = await getCatalog();
  const starters = packages.filter((p) => p.priceFrom !== null).slice(0, 3);
  const demo = getDemoProjects();
  const serviceItems = services.map((s) => ({
    slug: s.slug,
    name: s.name,
    summary: s.summary,
    icon: s.icon,
    price: s.pricing.kind === "from" ? `od ${formatPLN(s.pricing.amount)} netto` : "Wycena indywidualna",
  }));

  return (
    <>
      {/* ═════════ Hero ═════════ */}
      <section className="hero">
        <div className="hero-orb o1" aria-hidden="true" />
        <div className="hero-orb o2" aria-hidden="true" />
        <HeroField />
        <div className="hero-fade" aria-hidden="true" />

        <div className="container-v">
          <p className="kicker load-in" style={{ "--d": "0.05s" } as CSSProperties}>
            Agencja marketingowa i technologiczna
          </p>
          <Lines as="h1" mode="load" lines={["Marketing,", "który napędza", "rozwój."]} className="t-mega mt-6" />

          <div className="hero-meta">
            <p className="t-lead load-in" style={{ "--d": "0.55s" } as CSSProperties}>
              Strategia, technologia i kreatywność połączone w jeden system pozyskiwania klientów.
            </p>
            <div className="load-in flex flex-wrap gap-3 xl:flex-nowrap" style={{ "--d": "0.65s" } as CSSProperties}>
              <Magnetic>
                <Link href="#uslugi" className="btn btn-primary btn-lg">
                  Poznaj nasze możliwości
                </Link>
              </Magnetic>
              <Magnetic>
                <Link href="/wycena" className="btn btn-outline btn-lg">
                  Porozmawiajmy o Twoim biznesie <ArrowUpRight size={18} className="btn-icon" aria-hidden="true" />
                </Link>
              </Magnetic>
            </div>
            <a href="#o-nas" className="scroll-cue load-in hidden xl:inline-flex" style={{ "--d": "0.8s" } as CSSProperties}>
              <span className="track" aria-hidden="true" />
              Przewiń
            </a>
          </div>
        </div>
      </section>

      {/* ═════════ Kompetencje — przesuwający się pasek ═════════ */}
      <Marquee items={competences} />

      {/* ═════════ Wprowadzenie + liczniki ═════════ */}
      <section id="o-nas" className="section container-v">
        <p className="kicker" data-reveal>Kim jesteśmy</p>
        <p className="t-statement mt-8" data-reveal style={{ "--d": "0.08s" } as CSSProperties}>
          Partner technologiczno-marketingowy dla firm, które chcą rosnąć — <span className="t-faint">a nie tylko „być w internecie”.</span>
        </p>
        <dl className="mt-20 grid grid-cols-2 gap-y-12 border-t border-line pt-12 md:grid-cols-4">
          {[
            { n: services.length, s: "", label: "obszarów usług w jednym miejscu" },
            { n: packages.length, s: "", label: "pakietów z jasnym zakresem" },
            { n: plans.length, s: "", label: "form stałej współpracy" },
            { n: 1, s: "", label: "partner zamiast kilku agencji" },
          ].map((st, i) => (
            <div key={st.label} className={`pr-6 ${i > 0 ? "md:border-l md:border-line md:pl-8" : ""}`} data-reveal style={{ "--d": `${i * 0.08}s` } as CSSProperties}>
              <dt className="sr-only">{st.label}</dt>
              <dd>
                <span className="stat-num block">
                  <CountUp to={st.n} suffix={st.s} />
                </span>
                <span className="t-muted mt-3 block max-w-[16ch]">{st.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ═════════ Wyzwania ═════════ */}
      <section className="section border-t border-line bg-bg-2">
        <div className="container-v">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <Lines lines={["Z tym przychodzą", "do nas firmy."]} className="t-h2" />
            <p className="t-muted max-w-md" data-reveal>
              Rzadko chodzi o „nową stronę” albo „więcej reklam”. Zwykle coś w drodze od pierwszego kontaktu do sprzedaży nie działa.
            </p>
          </div>
          <ul className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {challenges.map((c, i) => (
              <li key={c.problem} data-reveal style={{ "--d": `${(i % 3) * 0.08}s` } as CSSProperties}>
                <TiltCard className="card-v h-full">
                  <Link href={c.href} className="group flex h-full flex-col p-7 md:p-8">
                    <span className="grid size-11 place-items-center rounded-full border border-line-strong text-ink-2 transition-all duration-500 group-hover:rotate-45 group-hover:border-accent group-hover:bg-accent group-hover:text-white">
                      <ArrowUpRight size={20} aria-hidden="true" />
                    </span>
                    <p className="mt-10 text-[1.35rem] font-bold leading-snug tracking-[-0.025em]">{c.problem}</p>
                    <p className="t-muted mt-4">{c.answer}</p>
                  </Link>
                </TiltCard>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═════════ Usługi ═════════ */}
      <section id="uslugi" className="section container-v">
        <div className="mb-14 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="kicker" data-reveal>Usługi</p>
            <Lines lines={["Wszystko, czego potrzebuje", "Twój marketing."]} className="t-h2 mt-6" />
          </div>
          <Link href="/uslugi" className="link-u shrink-0" data-reveal>Wszystkie usługi</Link>
        </div>
        <ServiceIndex items={serviceItems} />
      </section>

      {/* ═════════ Proces ═════════ */}
      <section className="section border-t border-line">
        <div className="container-v grid gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)] lg:self-start">
            <p className="kicker" data-reveal>Proces</p>
            <Lines lines={["Jak", "pracujemy."]} className="t-h2 mt-6" />
            <p className="t-muted mt-6 max-w-md" data-reveal>
              Pięć etapów, w tej samej kolejności przy każdym projekcie. Na końcu każdego wiesz, co dostałeś i co dalej.
            </p>
          </div>
          <ProcessTimeline steps={steps} />
        </div>
      </section>

      {/* ═════════ Pomiar ═════════ */}
      <section className="section border-t border-line bg-bg-2">
        <div className="container-v grid items-center gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <p className="kicker" data-reveal>Pomiar wyników</p>
            <Lines lines={["Widzisz, co", "przynosi klientów."]} className="t-h2 mt-6" />
            <p className="t-muted mt-6 max-w-md" data-reveal>
              Każde zapytanie ma źródło i koszt. W panelu klienta zobaczysz raporty z podanym źródłem danych, zakresem dat i momentem ostatniej aktualizacji.
            </p>
            <Link href="/uslugi/analityka-i-pomiar" className="link-u mt-8 inline-block" data-reveal>Analityka i pomiar</Link>
          </div>
          <DemoDashboard />
        </div>
      </section>

      {/* ═════════ Pakiety ═════════ */}
      <section className="section container-v">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="kicker" data-reveal>Pakiety</p>
            <Lines lines={["Na dobry", "początek."]} className="t-h2 mt-6" />
          </div>
          <Link href="/pakiety" className="link-u shrink-0" data-reveal>Porównaj wszystkie pakiety</Link>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {starters.map((p, i) => (
            <div key={p.slug} data-reveal style={{ "--d": `${i * 0.1}s` } as CSSProperties}>
              <PackageCard pkg={p} compact />
            </div>
          ))}
        </div>
        <Link
          href="/wycena?pakiet=custom"
          className="group mt-5 flex flex-col justify-between gap-4 rounded-[var(--radius-lg)] border border-dashed border-line-strong p-7 transition-colors hover:border-accent md:flex-row md:items-center"
          data-reveal
        >
          <span>
            <span className="block text-xl font-bold tracking-tight">Większy zakres? GROWTH i CUSTOM / ENTERPRISE</span>
            <span className="t-muted t-small mt-1 block">Rozbudowane wdrożenia, wiele procesów i rynków, z indywidualną wyceną.</span>
          </span>
          <span className="inline-flex items-center gap-2 font-semibold text-accent-text">
            Poproś o wycenę
            <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:rotate-45" aria-hidden="true" />
          </span>
        </Link>
      </section>

      {/* ═════════ Dlaczego VELIO ═════════ */}
      <section className="section border-t border-line">
        <div className="container-v grid gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-[calc(var(--header-h)+48px)] lg:self-start">
            <p className="kicker" data-reveal>Dlaczego VELIO</p>
            <Lines lines={["Mniej", "agencji.", "Więcej", "wyników."]} className="t-h2 mt-6" />
          </div>
          <ul>
            {reasons.map((r, i) => (
              <li key={r.title} className="group border-b border-line py-9 first:border-t" data-reveal style={{ "--d": `${i * 0.06}s` } as CSSProperties}>
                <h3 className="t-row transition-colors duration-300 group-hover:text-accent-text">
                  {r.title}
                </h3>
                <p className="t-muted mt-3 max-w-lg">{r.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ═════════ Realizacje ═════════ */}
      <section className="section border-t border-line bg-bg-2">
        <div className="container-v">
          <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <p className="kicker" data-reveal>Realizacje</p>
              <Lines lines={["Jak wygląda", "praca z nami."]} className="t-h2 mt-6" />
              <p className="t-muted mt-6 max-w-xl" data-reveal>
                Poniżej projekty demonstracyjne z typowym zakresem prac. Nie są to realizacje dla klientów i nie podajemy przy nich wyników.
              </p>
            </div>
            <Link href="/realizacje" className="link-u shrink-0" data-reveal>Wszystkie projekty</Link>
          </div>
          <DemoProjects projects={demo} />
        </div>
      </section>

      {/* ═════════ FAQ ═════════ */}
      <section className="section container-v grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
        <div>
          <p className="kicker" data-reveal>FAQ</p>
          <Lines lines={["Pytania przed", "rozpoczęciem."]} className="t-h2 mt-6" />
          <p className="t-muted mt-6" data-reveal>
            Nie znalazłeś odpowiedzi? <Link href="/faq" className="link-u">Wszystkie pytania</Link> albo{" "}
            <Link href="/kontakt" className="link-u">napisz do nas</Link>.
          </p>
        </div>
        <FaqList items={faqs.slice(0, 6)} />
      </section>

      <CtaBand />
    </>
  );
}
