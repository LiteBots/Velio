import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CtaBand, PageHero } from "@/components/ui/blocks";
import { ServiceIcon } from "@/components/ui/service-icon";
import { TiltCard } from "@/components/motion/interactive";
import type { CSSProperties } from "react";
import { getServices } from "@/lib/catalog/repository";
import type { ServiceGroup } from "@/lib/catalog/types";

export const metadata: Metadata = {
  title: "Usługi marketingowe, strony, SEO, reklamy i automatyzacje",
  description:
    "Wszystkie usługi VELIO: strony internetowe, SEO, reklamy Google i Meta, AI i automatyzacje, branding, druk, CRM, strategia, employer branding, ekspansja i analityka.",
  alternates: { canonical: "/uslugi" },
};

const groups: { id: ServiceGroup; name: string; text: string }[] = [
  { id: "digital", name: "Digital & Web", text: "Miejsce, w którym klient poznaje ofertę i wysyła zapytanie." },
  { id: "performance", name: "Performance Marketing", text: "Ruch z wyszukiwarki i reklam — mierzony w zapytaniach." },
  { id: "ai", name: "AI & Automation", text: "Mniej ręcznej pracy przy obsłudze klientów i danych." },
  { id: "brand", name: "Branding & Creative", text: "Marka, materiały drukowane, odzież i komunikacja pracodawcy." },
  { id: "growth", name: "Growth & Sales", text: "Strategia, lejek sprzedaży, CRM i nowe rynki." },
];

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      <PageHero
        crumbs={[{ name: "Usługi", href: "/uslugi" }]}
        title="Usługi, które pracują razem."
        lead="Każdą usługę możesz zamówić osobno. Projektujemy je jednak tak, żeby strona, kampanie, automatyzacje i marka tworzyły jeden system."
      />
      <div className="container-v pb-20">
        {groups.map((g) => {
          const items = services.filter((s) => s.group === g.id);
          if (items.length === 0) return null;
          return (
            <section key={g.id} aria-labelledby={`g-${g.id}`} className="grid gap-6 border-t border-line py-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div data-reveal>
                <h2 id={`g-${g.id}`} className="t-h3">{g.name}</h2>
                <p className="t-small t-muted mt-2 max-w-xs">{g.text}</p>
              </div>
              <ul className="grid gap-3 sm:grid-cols-2">
                {items.map((s, i) => (
                  <li key={s.slug} data-reveal style={{ "--d": `${i * 0.07}s` } as CSSProperties}>
                    <TiltCard className="card-v h-full">
                    <Link
                      href={`/uslugi/${s.slug}`}
                      className="group flex h-full flex-col p-7"
                    >
                      <div className="flex items-center justify-between">
                        <span className="grid size-12 place-items-center rounded-2xl bg-surface-2 text-ink-2 transition-all duration-500 group-hover:bg-accent group-hover:text-white group-hover:shadow-[0_0_30px_var(--accent-glow)]"><ServiceIcon name={s.icon} size={22} /></span>
                        <ArrowUpRight size={18} className="text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                      </div>
                      <h3 className="mt-8 text-xl font-bold leading-snug tracking-tight">{s.name}</h3>
                      <p className="t-small t-muted mt-2">{s.summary}</p>
                    </Link>
                    </TiltCard>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
      <CtaBand title="Nie wiesz, którą usługę wybrać?" text="Opisz cel i sytuację firmy. Zaproponujemy, od czego zacząć, żeby najszybciej zobaczyć efekt." />
    </>
  );
}
