import { z } from "zod";

/** Wspólny schemat walidacji zapytań — używany w formularzu (klient) i w API (serwer). */

export const needOptions = [
  { value: "strona", label: "Strona internetowa" },
  { value: "seo", label: "SEO" },
  { value: "reklamy", label: "Reklamy" },
  { value: "ai", label: "AI i automatyzacje" },
  { value: "branding", label: "Branding" },
  { value: "druk", label: "Druk i materiały" },
  { value: "crm", label: "CRM i sprzedaż" },
  { value: "inne", label: "Inne" },
] as const;

export const budgetOptions = [
  { value: "do-3k", label: "do 3 000 zł netto" },
  { value: "3-8k", label: "3 000 – 8 000 zł netto" },
  { value: "8-20k", label: "8 000 – 20 000 zł netto" },
  { value: "20k+", label: "powyżej 20 000 zł netto" },
  { value: "nie-wiem", label: "Jeszcze nie wiem — potrzebuję rekomendacji" },
] as const;

export const sizeOptions = [
  { value: "1", label: "Jednoosobowa" },
  { value: "2-9", label: "2–9 osób" },
  { value: "10-49", label: "10–49 osób" },
  { value: "50+", label: "50 i więcej" },
] as const;

export const timelineOptions = [
  { value: "asap", label: "Jak najszybciej" },
  { value: "1-3m", label: "W ciągu 1–3 miesięcy" },
  { value: "pozniej", label: "Później / planuję" },
] as const;

export const formTypes = ["wycena", "kontakt", "usluga", "druk", "automatyzacje", "indywidualny"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Maksymalnie ${max} znaków.`)
    .optional()
    .transform((v) => (v ? v : undefined));

const websiteSchema = z
  .string()
  .trim()
  .max(200)
  .optional()
  .transform((v) => (v ? v : undefined))
  .refine((v) => !v || /^(https?:\/\/)?[\w-]+(\.[\w-]+)+(\/.*)?$/i.test(v), "Podaj poprawny adres strony, np. firma.pl.");

export const printDetailsSchema = z
  .object({
    product: optionalText(120),
    format: optionalText(80),
    quantity: optionalText(40),
    material: optionalText(120),
    finish: optionalText(120),
    deadline: optionalText(40),
    filesUrl: z
      .string()
      .trim()
      .max(500)
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^https?:\/\//i.test(v), "Link do plików powinien zaczynać się od https://"),
  })
  .partial();

export const automationDetailsSchema = z
  .object({
    process: optionalText(1500),
    tools: optionalText(500),
    volume: optionalText(120),
  })
  .partial();

export const leadSchema = z.object({
  formType: z.enum(formTypes),
  needs: z.array(z.enum(needOptions.map((o) => o.value) as [string, ...string[]])).max(8).default([]),
  service: optionalText(80),
  packageSlug: optionalText(80),
  company: z
    .object({
      name: optionalText(160),
      industry: optionalText(120),
      website: websiteSchema,
      size: z.enum(sizeOptions.map((o) => o.value) as [string, ...string[]]).optional(),
    })
    .default({}),
  goals: optionalText(3000),
  timeline: z.enum(timelineOptions.map((o) => o.value) as [string, ...string[]]).optional(),
  budget: z.enum(budgetOptions.map((o) => o.value) as [string, ...string[]]).optional(),
  print: printDetailsSchema.optional(),
  automation: automationDetailsSchema.optional(),
  contact: z.object({
    name: z.string().trim().min(2, "Podaj imię i nazwisko.").max(120),
    email: z.string().trim().toLowerCase().email("Podaj poprawny adres e-mail.").max(160),
    phone: z
      .string()
      .trim()
      .max(30)
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => !v || /^[+\d][\d\s()-]{6,}$/.test(v), "Podaj poprawny numer telefonu."),
    preferred: z.enum(["email", "telefon"]).optional(),
  }),
  consents: z.object({
    privacy: z.literal(true, { errorMap: () => ({ message: "Zgoda jest wymagana, żebyśmy mogli odpowiedzieć." }) }),
    marketing: z.boolean().default(false),
  }),
  // antyspam
  website_url: z.string().max(0).optional(), // honeypot — prawdziwy użytkownik go nie widzi
  startedAt: z.number().int().positive(),
  source: z
    .object({
      page: optionalText(300),
      referrer: optionalText(500),
    })
    .optional(),
});

export type LeadInput = z.input<typeof leadSchema>;
export type LeadData = z.output<typeof leadSchema>;
