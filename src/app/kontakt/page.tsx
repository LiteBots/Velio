import type { Metadata } from "next";
import Link from "next/link";
import { ShortInquiryForm } from "@/components/forms/short-inquiry-form";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { getPackages, getPlans } from "@/lib/catalog/repository";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Kontakt",
  description: "Napisz do VELIO. Odpowiemy z propozycją kolejnego kroku — krótkiej rozmowy albo wstępnej wyceny.",
  alternates: { canonical: "/kontakt" },
};

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function ContactPage({ searchParams }: Props) {
  const sp = await searchParams;
  const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const [packages, plans] = await Promise.all([getPackages(), getPlans()]);
  const pkg = packages.find((p) => p.slug === one(sp.pakiet));
  const plan = plans.find((p) => p.slug === one(sp.abonament));
  const { contact, company } = siteConfig;

  return (
    <section className="container-v grid gap-12 pb-24 pt-10 md:pt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
      <div>
        <Breadcrumbs items={[{ name: "Kontakt", href: "/kontakt" }]} />
        <h1 className="t-h1 mt-8">Napisz do nas.</h1>
        <p className="t-lead mt-6">
          Krótka wiadomość wystarczy. Jeśli wolisz od razu opisać projekt, skorzystaj z{" "}
          <Link href="/wycena" className="link-u">formularza wyceny</Link>.
        </p>

        <dl className="mt-10 grid gap-6 border-t border-line pt-8">
          {contact.email && (
            <div>
              <dt className="t-small t-faint font-semibold">E-mail</dt>
              <dd className="mt-1 text-lg font-semibold"><a href={`mailto:${contact.email}`} className="hover:text-accent-text">{contact.email}</a></dd>
            </div>
          )}
          {contact.phone && (
            <div>
              <dt className="t-small t-faint font-semibold">Telefon</dt>
              <dd className="mt-1 text-lg font-semibold"><a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-accent-text">{contact.phone}</a></dd>
            </div>
          )}
          {(company.legalName || company.address) && (
            <div>
              <dt className="t-small t-faint font-semibold">Dane firmy</dt>
              <dd className="t-muted mt-1">
                {company.legalName && <span className="block">{company.legalName}</span>}
                {company.address && <span className="block">{company.address}</span>}
                {company.nip && <span className="block">NIP {company.nip}</span>}
              </dd>
            </div>
          )}
          {!contact.email && !contact.phone && (
            <p className="t-small t-faint">Dane kontaktowe zostaną uzupełnione wkrótce. Formularz obok działa i trafia bezpośrednio do nas.</p>
          )}
        </dl>
      </div>

      <div className="lg:pt-2">
        {(pkg || plan) && (
          <p className="mb-6">
            <span className="tag tag-accent">{pkg ? `Pakiet: ${pkg.name}` : `Abonament: ${plan!.name}`}</span>
          </p>
        )}
        <ShortInquiryForm
          formType="kontakt"
          packageSlug={pkg?.slug}
          service={plan ? `abonament:${plan.slug}` : undefined}
          messageLabel="Wiadomość"
          messagePlaceholder="W czym możemy pomóc?"
        />
      </div>
    </section>
  );
}
