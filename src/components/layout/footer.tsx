import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/lib/config";
import { t } from "@/i18n/pl";
import { ThemeSegmented } from "./theme-toggle";

type FooterService = { slug: string; name: string };

export function Footer({ services }: { services: FooterService[] }) {
  const { company, contact, social } = siteConfig;
  const hasCompany = company.legalName || company.address || company.nip || company.regon;
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line bg-surface">
      <div className="container-v grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-4">
          <Logo size="lg" />
          <p className="t-muted mt-5 max-w-sm">
            Partner technologiczno-marketingowy. Pomagamy firmom zdobywać klientów, budować rozpoznawalność i automatyzować codzienną pracę.
          </p>
          <div className="mt-6">
            <ThemeSegmented />
          </div>
        </div>

        <nav aria-label="Usługi" className="md:col-span-4">
          <h2 className="t-small t-faint mb-4 font-semibold">{t.nav.services}</h2>
          <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
            {services.map((s) => (
              <li key={s.slug}>
                <Link href={`/uslugi/${s.slug}`} className="t-small text-ink-2 hover:text-ink">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Firma" className="md:col-span-2">
          <h2 className="t-small t-faint mb-4 font-semibold">VELIO</h2>
          <ul className="grid gap-2">
            {[
              ["/pakiety", t.nav.packages],
              ["/abonamenty", t.nav.plans],
              ["/realizacje", t.nav.work],
              ["/o-nas", t.nav.about],
              ["/blog", t.nav.blog],
              ["/faq", t.nav.faq],
              ["/kontakt", t.nav.contact],
            ].map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="t-small text-ink-2 hover:text-ink">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-2">
          <h2 className="t-small t-faint mb-4 font-semibold">Kontakt</h2>
          <ul className="t-small grid gap-2 text-ink-2">
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-ink">{contact.email}</a>
              </li>
            )}
            {contact.phone && (
              <li>
                <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-ink">{contact.phone}</a>
              </li>
            )}
            <li>
              <Link href="/wycena" className="link-u">Formularz wyceny</Link>
            </li>
            {social.map((s) => (
              <li key={s.label}>
                <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-ink">{s.label}</a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-v flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
          <div className="t-small t-faint">
            © {year} {company.legalName ?? "VELIO"}
            {hasCompany && (
              <span className="block md:inline">
                {company.address && <span className="md:ml-3">{company.address}</span>}
                {company.nip && <span className="ml-3">NIP {company.nip}</span>}
                {company.regon && <span className="ml-3">REGON {company.regon}</span>}
              </span>
            )}
          </div>
          <ul className="t-small flex flex-wrap gap-x-5 gap-y-2 text-ink-3">
            <li><Link href="/polityka-prywatnosci" className="hover:text-ink">Polityka prywatności</Link></li>
            <li><Link href="/cookies" className="hover:text-ink">Ustawienia cookies</Link></li>
            <li><Link href="/regulamin" className="hover:text-ink">Regulamin</Link></li>
            <li><Link href="/polityka-prywatnosci#przetwarzanie-danych" className="hover:text-ink">Przetwarzanie danych</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
