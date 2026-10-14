import type { Metadata } from "next";
import Link from "next/link";
import { CtaBand, PageHero } from "@/components/ui/blocks";
import { getPlans, getServices } from "@/lib/catalog/repository";
import { billingLabels, type BillingType } from "@/lib/catalog/types";
import { formatPLN, vatLabel } from "@/lib/config";

export const metadata: Metadata = {
  title: "Stała współpraca i abonamenty — opieka, SEO, reklamy, AI",
  description:
    "Abonamenty VELIO: opieka nad stroną, stała obsługa reklam, abonament SEO, abonament AI, druk na zamówienie i audyt marketingowy.",
  alternates: { canonical: "/abonamenty" },
};

const billingOrder: BillingType[] = ["one_time", "subscription", "invoice", "quote", "manual_approval"];
const billingExplain: Record<BillingType, string> = {
  one_time: "Płacisz raz za określony zakres prac.",
  subscription: "Odnawia się automatycznie co miesiąc, możesz ją zakończyć zgodnie z umową.",
  invoice: "Miesięczna faktura za uzgodniony zakres.",
  quote: "Cena ustalana po poznaniu potrzeb.",
  manual_approval: "Realizujemy po sprawdzeniu parametrów i Twojej akceptacji.",
};

export default async function PlansPage() {
  const [plans, services] = await Promise.all([getPlans(), getServices()]);

  return (
    <>
      <PageHero
        crumbs={[{ name: "Stała współpraca", href: "/abonamenty" }]}
        title="Stała współpraca."
        lead="Usługa jednorazowa, miesięczny abonament albo indywidualna umowa. Przy każdej usłudze widzisz, jak jest rozliczana."
      />

      <section className="container-v pb-16">
        <ul className="border-t border-line">
          {plans.map((p) => {
            const related = p.relatedService ? services.find((s) => s.slug === p.relatedService) : undefined;
            return (
              <li key={p.slug} id={p.slug} className="grid gap-6 border-b border-line py-10 lg:grid-cols-[1fr_1.1fr_0.7fr] lg:gap-12">
                <div>
                  <h2 className="t-h3">{p.name}</h2>
                  <p className="t-muted mt-2">{p.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {p.billing.map((b) => (
                      <span key={b} className="tag">{billingLabels[b]}</span>
                    ))}
                  </div>
                </div>
                <ul className="grid content-start gap-x-6 gap-y-2 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2.5 text-[0.95rem]">
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-col items-start gap-3 lg:items-end lg:text-right">
                  {p.priceFrom !== null ? (
                    <p className="text-2xl font-bold tracking-tight">
                      od {formatPLN(p.priceFrom)}
                      <span className="t-small t-faint block font-normal">{p.priceUnit}, {vatLabel()}</span>
                    </p>
                  ) : (
                    <p className="font-bold">Cena ustalana w wycenie</p>
                  )}
                  <Link
                    href={p.slug === "druk-na-zamowienie" ? "/wycena?formularz=druk" : `/kontakt?abonament=${p.slug}`}
                    className="btn btn-ink btn-sm"
                  >
                    {p.slug === "druk-na-zamowienie" ? "Złóż zamówienie" : "Zapytaj o abonament"}
                  </Link>
                  {related && (
                    <Link href={`/uslugi/${related.slug}`} className="t-small link-u">
                      Usługa: {related.name}
                    </Link>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section-tight bg-bg-2">
        <div className="container-v">
          <h2 className="t-h2">Jak rozliczamy</h2>
          <dl className="mt-10 grid gap-x-8 border-t border-line sm:grid-cols-2 lg:grid-cols-5">
            {billingOrder.map((b) => (
              <div key={b} className="border-b border-line py-6 lg:border-b-0">
                <dt className="font-bold">{billingLabels[b]}</dt>
                <dd className="t-small t-muted mt-1.5">{billingExplain[b]}</dd>
              </div>
            ))}
          </dl>
          <p className="t-small t-faint mt-8 max-w-2xl">
            Płatności online uruchomimy wraz z panelem klienta. Do tego czasu rozliczamy się na podstawie faktury — żadna płatność nie jest pobierana przez stronę.
          </p>
        </div>
      </section>

      <CtaBand title="Porozmawiajmy o stałej współpracy." text="Powiedz, co chcesz rozwijać co miesiąc. Zaproponujemy zakres i sposób rozliczenia." secondary={null} />
    </>
  );
}
