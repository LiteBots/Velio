import type { Metadata } from "next";
import { DemoProjects } from "@/components/home/demo-projects";
import { CtaBand, PageHero } from "@/components/ui/blocks";
import { getDemoProjects } from "@/lib/catalog/repository";

export const metadata: Metadata = {
  title: "Realizacje",
  description: "Projekty VELIO. Do czasu publikacji pierwszych realizacji pokazujemy wyraźnie oznaczone projekty demonstracyjne z typowym zakresem prac.",
  alternates: { canonical: "/realizacje" },
};

export default function WorkPage() {
  return (
    <>
      <PageHero
        crumbs={[{ name: "Realizacje", href: "/realizacje" }]}
        title="Realizacje"
        lead="Tu będziemy publikować projekty zrealizowane dla klientów — za ich zgodą i z prawdziwymi danymi. Na razie pokazujemy projekty demonstracyjne, żeby było widać, jak wygląda typowy zakres prac."
      />
      <section className="container-v pb-24">
        <p className="t-small rounded-[var(--radius-sm)] bg-accent-soft p-4 text-ink">
          Projekty poniżej nie są realizacjami dla klientów. Nie przypisujemy im wyników ani opinii.
        </p>
        <DemoProjects projects={getDemoProjects()} />
      </section>
      <CtaBand title="Twój projekt może być pierwszy na tej liście." />
    </>
  );
}
