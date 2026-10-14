import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { CookieBanner } from "@/components/layout/cookie-banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { Cursor } from "@/components/motion/interactive";
import { RevealObserver } from "@/components/motion/reveal-observer";
import { getServices } from "@/lib/catalog/repository";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const font = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-velio",
  display: "swap",
});

/** Oferta pochodzi z bazy — strony odświeżają się w tle co 5 minut. */
export const revalidate = 300;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "VELIO — marketing, technologia i automatyzacje dla firm",
    template: "%s | VELIO",
  },
  description: siteConfig.description,
  applicationName: "VELIO",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: "VELIO",
    url: siteConfig.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [
    { color: "#0c0d10" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
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
    <html lang="pl" suppressHydrationWarning className={font.variable}>
      <head>
        {/* klasa .js włącza animacje wejścia — bez JavaScriptu treść jest od razu widoczna */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <a href="#tresc" className="skip-link">Przejdź do treści</a>
        <ThemeProvider>
          <Header services={nav} />
          <div className="header-spacer" aria-hidden="true" />
          <main id="tresc">{children}</main>
          <Footer services={nav} />
          <CookieBanner />
          <RevealObserver />
          <Cursor />
        </ThemeProvider>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }} />
      </body>
    </html>
  );
}
