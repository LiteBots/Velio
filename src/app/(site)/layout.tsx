import { CookieBanner } from "@/components/layout/cookie-banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { Cursor } from "@/components/motion/interactive";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { getServices } from "@/lib/catalog/repository";
import { siteConfig } from "@/lib/config";

/** Oferta pochodzi z bazy — strony odświeżają się w tle co 5 minut (zmiany z panelu od razu). */
export const revalidate = 300;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const services = await getServices();
  const nav = services.map((s) => ({ slug: s.slug, name: s.name, summary: s.summary, icon: s.icon }));

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteConfig.company.legalName ?? "VELIO",
    url: siteConfig.url,
    logo: `${siteConfig.url}/brand/velio-mark.svg`,
    ...(siteConfig.contact.email ? { email: siteConfig.contact.email } : {}),
    ...(siteConfig.social.length ? { sameAs: siteConfig.social.map((s) => s.href) } : {}),
  };

  return (
    <>
      <a href="#tresc" className="skip-link">Przejdź do treści</a>
      <Header services={nav} />
      <div className="header-spacer" aria-hidden="true" />
      <main id="tresc">{children}</main>
      <Footer services={nav} />
      <CookieBanner />
      <RevealObserver />
      <Cursor />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
    </>
  );
}
