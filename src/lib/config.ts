/**
 * Konfiguracja publiczna (dane firmy, VAT, adres strony).
 * Wszystkie dane formalne pochodzą ze zmiennych środowiskowych — nic nie jest tu wymyślone.
 * Pusta wartość = pole nie jest wyświetlane.
 */
const clean = (v: string | undefined) => (v && v.trim().length > 0 ? v.trim() : null);

export const siteConfig = {
  name: "VELIO",
  url: (clean(process.env.NEXT_PUBLIC_SITE_URL) ?? "http://localhost:3000").replace(/\/$/, ""),
  description:
    "VELIO łączy strategię, technologię i kreatywność w jeden system pozyskiwania klientów: strony, SEO, reklamy, automatyzacje AI i branding.",
  locale: "pl_PL",
  vatRate: Number(process.env.NEXT_PUBLIC_VAT_RATE ?? "23"),
  company: {
    legalName: clean(process.env.NEXT_PUBLIC_COMPANY_LEGAL_NAME),
    address: clean(process.env.NEXT_PUBLIC_COMPANY_ADDRESS),
    nip: clean(process.env.NEXT_PUBLIC_COMPANY_NIP),
    regon: clean(process.env.NEXT_PUBLIC_COMPANY_REGON),
  },
  contact: {
    email: clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL),
    phone: clean(process.env.NEXT_PUBLIC_CONTACT_PHONE),
  },
  social: [
    { label: "LinkedIn", href: clean(process.env.NEXT_PUBLIC_SOCIAL_LINKEDIN) },
    { label: "Instagram", href: clean(process.env.NEXT_PUBLIC_SOCIAL_INSTAGRAM) },
    { label: "Facebook", href: clean(process.env.NEXT_PUBLIC_SOCIAL_FACEBOOK) },
  ].filter((s): s is { label: string; href: string } => Boolean(s.href)),
} as const;

export function formatPLN(value: number) {
  return new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(value);
}

export function vatLabel() {
  return siteConfig.vatRate > 0 ? `netto + ${siteConfig.vatRate}% VAT` : "netto (zw. z VAT)";
}
