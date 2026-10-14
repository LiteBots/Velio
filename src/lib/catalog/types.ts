/** Typy katalogu oferty. Te same kształty są zapisywane w MongoDB (scripts/seed.mjs). */

export type IconName =
  | "layout"
  | "search"
  | "megaphone"
  | "workflow"
  | "pen"
  | "printer"
  | "shirt"
  | "target"
  | "mail"
  | "users"
  | "globe"
  | "chart";

export type ServiceGroup = "digital" | "performance" | "ai" | "brand" | "growth";

export type FaqItem = { q: string; a: string };

export type PricingMode =
  | { kind: "from"; amount: number; unit?: string; note?: string }
  | { kind: "quote"; note?: string };

export type Service = {
  slug: string;
  order: number;
  group: ServiceGroup;
  icon: IconName;
  name: string;
  /** krótki opis do list */
  summary: string;
  /** dłuższe wprowadzenie na podstronie */
  intro: string;
  scope: string[];
  benefits: { title: string; text: string }[];
  process: { title: string; text: string }[];
  pricing: PricingMode;
  /** dodatkowa informacja wyświetlana obok ceny, np. o budżecie reklamowym */
  pricingNotice?: string;
  faq: FaqItem[];
  /** który wariant formularza zapytania otwierać */
  formVariant: "ogolny" | "druk" | "automatyzacje";
  seo: { title: string; description: string };
  published: boolean;
};

export type Package = {
  slug: string;
  order: number;
  name: string;
  audience: string;
  description: string;
  priceFrom: number | null;
  priceUnit: string;
  duration: string;
  includes: string[];
  limits: string[];
  extensions: string[];
  addons: { name: string; note: string }[];
  separateCosts?: string;
  featured: boolean;
  published: boolean;
};

export type BillingType = "one_time" | "subscription" | "invoice" | "quote" | "manual_approval";

export type Plan = {
  slug: string;
  order: number;
  name: string;
  summary: string;
  features: string[];
  billing: BillingType[];
  priceFrom: number | null;
  priceUnit: string;
  relatedService?: string;
  published: boolean;
};

export type Faq = FaqItem & { slug: string; order: number; category: string; published: boolean };

export type DemoProject = {
  slug: string;
  title: string;
  kind: string;
  brief: string;
  scope: string[];
  /** kolor kompozycji w podglądzie */
  motif: "grid" | "wave" | "stack";
};

export type CatalogSource = "database" | "seed";

export type Catalog = {
  services: Service[];
  packages: Package[];
  plans: Plan[];
  faqs: Faq[];
  source: CatalogSource;
};

export const billingLabels: Record<BillingType, string> = {
  one_time: "Płatność jednorazowa",
  subscription: "Subskrypcja odnawialna",
  invoice: "Abonament na fakturę",
  quote: "Indywidualna wycena",
  manual_approval: "Wymaga akceptacji zamówienia",
};
