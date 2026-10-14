/** Etykiety i kolory używane w panelu administratora. */

export const leadStatuses = [
  { value: "nowy", label: "Nowy lead", tone: "#7357ff" },
  { value: "pierwszy_kontakt", label: "Pierwszy kontakt", tone: "#5aa9ff" },
  { value: "kwalifikacja", label: "Kwalifikacja", tone: "#3cc8d8" },
  { value: "spotkanie", label: "Spotkanie", tone: "#3ccf95" },
  { value: "oferta", label: "Oferta wysłana", tone: "#e6c34a" },
  { value: "negocjacje", label: "Negocjacje", tone: "#f29a4a" },
  { value: "wygrany", label: "Wygrany", tone: "#2fbf71" },
  { value: "przegrany", label: "Przegrany", tone: "#7a7f8c" },
] as const;

export type LeadStatus = (typeof leadStatuses)[number]["value"];

export const statusLabel = (v: string) => leadStatuses.find((s) => s.value === v)?.label ?? v;
export const statusTone = (v: string) => leadStatuses.find((s) => s.value === v)?.tone ?? "#7a7f8c";

/** Etapy, w których szansa sprzedaży jest otwarta (do wartości lejka). */
export const openStatuses: string[] = ["nowy", "pierwszy_kontakt", "kwalifikacja", "spotkanie", "oferta", "negocjacje"];

export const formTypeLabels: Record<string, string> = {
  wycena: "Wycena (kreator)",
  kontakt: "Kontakt",
  usluga: "Zapytanie o usługę",
  druk: "Zamówienie druku",
  automatyzacje: "Automatyzacje",
  indywidualny: "Projekt indywidualny",
};

export const adminActionLabels: Record<string, string> = {
  logowanie: "Logowanie",
  logowanie_nieudane: "Nieudane logowanie",
  wylogowanie: "Wylogowanie",
  status: "Zmiana statusu",
  lead_edycja: "Edycja zgłoszenia",
  lead_notatka: "Notatka",
  lead_usuniecie: "Usunięcie zgłoszenia",
  eksport: "Eksport CSV",
  oferta: "Zmiana oferty",
  faq: "Zmiana FAQ",
  blog: "Zmiana bloga",
  uzytkownik: "Zmiana konta",
  seed: "Wgranie oferty startowej",
};

export const pln = (v: number) =>
  new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(v);

export const dateTime = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeStyle: "short", timeZone: "Europe/Warsaw" }).format(new Date(d)) : "—";

export const dateOnly = (d: Date | string | null | undefined) =>
  d ? new Intl.DateTimeFormat("pl-PL", { dateStyle: "medium", timeZone: "Europe/Warsaw" }).format(new Date(d)) : "—";
