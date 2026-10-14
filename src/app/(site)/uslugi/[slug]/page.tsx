import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check, Info } from "lucide-react";
import { ServiceInquiryForm } from "@/components/forms/service-inquiry-form";
import { FaqList, PageHero, Price } from "@/components/ui/blocks";
import { ServiceIcon } from "@/components/ui/service-icon";
import { getSeedServiceSlugs, getService, getServices } from "@/lib/catalog/repository";
import { siteConfig } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getSeedServiceSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const s = await getService(slug);
  if (!s) return { title: "Nie znaleziono usługi" };
  return {
    title: s.seo.title,
    description: s.seo.description,
    alternates: { canonical: `/uslugi/${s.slug}` },
    openGraph: { title: s.seo.title, description: s.seo.description, url: `/uslugi/${s.slug}` },
  };
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const [service, all] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  const related = all.filter((s) => s.slug !== service.slug && s.group === service.group).slice(0, 3);
  const formHref =
    service.formVariant === "druk"
      ? "/wycena?formularz=druk"
      : service.formVariant === "automatyzacje"
        ? "/wycena?formularz=automatyzacje"
        : `/wycena?usluga=${service.slug}`;

  const serviceJsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    description: service.intro,
    serviceType: service.name,
    provider: { "@type": "Organization", name: siteConfig.company.legalName ?? "VELIO", url: siteConfig.url },
    areaServed: "PL",
  };

  return (
    <>
      <PageHero
        crumbs={[
          { name: "Usługi", href: "/uslugi" },
          { name: service.name, href: `/uslugi/${service.slug}` },
        ]}
        title={service.name}
        lead={service.intro}
      >
        <div className="flex flex-wrap gap-3">
          <Link href="#zapytanie" className="btn btn-primary btn-lg">Zapytaj o tę usługę</Link>
          <Link href="/pakiety" className="btn btn-outline btn-lg">Zobacz pakiety</Link>
        </div>
      </PageHero>

      {/* Zakres + cena */}
      <section className="border-t border-line bg-bg-2">
        <div className="container-v grid gap-12 py-16 lg:grid-cols-[1.4fr_0.9fr] lg:gap-20 lg:py-20">
          <div>
            <h2 className="t-h2" data-reveal>Zakres usługi</h2>
            <ul className="mt-6 grid gap-x-8 sm:grid-cols-2">
              {service.scope.map((item) => (
                <li key={item} className="flex gap-3 border-b border-line py-4" data-reveal>
                  <Check size={18} className="mt-0.5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <aside aria-label="Cena" className="lg:pt-1">
            <div className="card-v p-8" data-reveal="scale">
              <span className="text-ink-2"><ServiceIcon name={service.icon} size={26} /></span>
              <h2 className="t-small t-faint mt-5 font-semibold">Cena</h2>
              <div className="mt-2">
                <Price pricing={service.pricing} />
              </div>
              {service.pricing.note && <p className="t-small t-muted mt-4">{service.pricing.note}</p>}
              {service.pricingNotice && (
                <p className="t-small mt-4 flex gap-2.5 rounded-[var(--radius-sm)] bg-accent-soft p-3.5 text-ink">
                  <Info size={17} className="mt-0.5 shrink-0 text-accent-text" aria-hidden="true" />
                  <span>{service.pricingNotice}</span>
                </p>
              )}
              <Link href={formHref} className="btn btn-ink mt-6 w-full">Otrzymaj wycenę</Link>
            </div>
          </aside>
        </div>
      </section>

      {/* Korzyści */}
      <section className="section-tight container-v">
        <h2 className="t-h2 max-w-[16ch]" data-reveal>Co zyskujesz</h2>
        <dl className="mt-10 grid gap-x-10 border-t border-line md:grid-cols-2 lg:grid-cols-4">
          {service.benefits.map((b) => (
            <div key={b.title} className="border-b border-line py-8 lg:border-b-0" data-reveal>
              <dt className="text-lg font-bold tracking-tight">{b.title}</dt>
              <dd className="t-muted mt-2">{b.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Proces */}
      <section className="section-tight container-v">
        <h2 className="t-h2" data-reveal>Przebieg realizacji</h2>
        <ol className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {service.process.map((p, i) => (
            <li key={p.title} className="card-v p-7" data-reveal>
              <span className="grid size-11 place-items-center rounded-full bg-accent text-sm font-bold text-white shadow-[0_0_24px_var(--accent-glow)]">{i + 1}</span>
              <h3 className="mt-5 font-bold tracking-tight">{p.title}</h3>
              <p className="t-small t-muted mt-2">{p.text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      {service.faq.length > 0 && (
        <section className="section-tight container-v grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <h2 className="t-h2">Pytania o {service.name.toLowerCase()}</h2>
          <FaqList items={service.faq} />
        </section>
      )}

      {/* Formularz */}
      <section id="zapytanie" className="border-t border-line bg-bg-2">
        <div className="container-v grid gap-12 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:py-24">
          <div>
            <h2 className="t-h2">Zapytaj o tę usługę</h2>
            <p className="t-muted mt-5 max-w-md">
              Odpowiemy z propozycją kolejnego kroku — krótkiej rozmowy albo wstępnej wyceny. Wolisz opisać projekt dokładniej?{" "}
              <Link href={formHref} className="link-u">Otwórz pełny formularz wyceny</Link>.
            </p>
          </div>
          <ServiceInquiryForm serviceSlug={service.slug} serviceName={service.name} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="section-tight container-v">
          <h2 className="t-h3">Powiązane usługi</h2>
          <ul className="mt-6 grid gap-3 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/uslugi/${r.slug}`} className="group flex h-full gap-4 rounded-[var(--radius)] border border-line p-5 transition-colors hover:border-ink">
                  <span className="text-ink-3 group-hover:text-accent"><ServiceIcon name={r.icon} size={20} /></span>
                  <span>
                    <span className="block font-semibold">{r.name}</span>
                    <span className="t-small t-muted mt-1 block">{r.summary}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
    </>
  );
}
