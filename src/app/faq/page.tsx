import type { Metadata } from "next";
import { CtaBand, FaqList, PageHero } from "@/components/ui/blocks";
import { getFaqs } from "@/lib/catalog/repository";

export const metadata: Metadata = {
  title: "Najczęstsze pytania",
  description: "Odpowiedzi na pytania o ceny, czas realizacji, współpracę, płatności, abonamenty i opiekę po wdrożeniu.",
  alternates: { canonical: "/faq" },
};

export default async function FaqPage() {
  const faqs = await getFaqs();
  const categories = Array.from(new Set(faqs.map((f) => f.category)));
  return (
    <>
      <PageHero crumbs={[{ name: "FAQ", href: "/faq" }]} title="Najczęstsze pytania" lead="Ceny, terminy, płatności i to, co dzieje się po zakończeniu projektu." />
      <div className="container-v pb-20">
        {categories.map((c) => (
          <section key={c} className="grid gap-6 border-t border-line py-10 lg:grid-cols-[0.6fr_1.4fr] lg:gap-16">
            <h2 className="t-h3">{c}</h2>
            <FaqList items={faqs.filter((f) => f.category === c)} withSchema={false} />
          </section>
        ))}
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
          }),
        }}
      />
      <CtaBand title="Masz inne pytanie?" text="Napisz — odpowiemy konkretnie, bez wysyłania ogólnej oferty." primary={{ href: "/kontakt", label: "Zadaj pytanie" }} secondary={null} />
    </>
  );
}
