// =====================================================================
//  Oferta VELIO: usługi, pakiety, abonamenty i FAQ.
//  Dane startowe są w server/data/catalog.json. Zmiany z panelu admina
//  (/admin/oferta) zapisują się w kolekcji `catalog` i nadpisują pola
//  z pliku — strona od razu pokazuje nowe ceny i opisy.
// =====================================================================
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from '../config.js';
import { findAll, col, nowIso } from '../db/index.js';

const SEED = JSON.parse(fs.readFileSync(path.join(ROOT, 'server/data/catalog.json'), 'utf8'));

export const KINDS = { services: 'Usługa', packages: 'Pakiet', plans: 'Abonament', faqs: 'Pytanie FAQ' };

// Ikony Lucide dla usług (nazwy z pliku JSON → nazwy w sprite)
const ICONS = {
  layout: 'layout-template', search: 'search', megaphone: 'megaphone', workflow: 'workflow', pen: 'pen-tool',
  printer: 'printer', shirt: 'shirt', target: 'target', mail: 'mail', users: 'users', globe: 'globe', chart: 'chart-column-big',
};
export const iconFor = (s) => ICONS[s.icon] || 'sparkles';

export const GROUPS = [
  { key: 'digital', name: 'Strony i technologia', tag: 'Fundament obecności online', icon: 'monitor-smartphone' },
  { key: 'performance', name: 'Widoczność i reklama', tag: 'SEO, kampanie, pomiar', icon: 'chart-spline' },
  { key: 'ai', name: 'AI i automatyzacje', tag: 'Mniej ręcznej pracy', icon: 'bot' },
  { key: 'brand', name: 'Marka i materiały', tag: 'Branding, druk, gadżety', icon: 'palette' },
  { key: 'growth', name: 'Strategia i wzrost', tag: 'Leady, CRM, nowe rynki', icon: 'rocket' },
];

// Pola, które można edytować w panelu admina (reszta zostaje z pliku startowego)
export const EDITABLE = {
  services: ['name', 'summary', 'intro', 'published', 'pricing.amount', 'pricing.note'],
  packages: ['name', 'audience', 'description', 'priceFrom', 'priceUnit', 'featured', 'published'],
  plans: ['name', 'summary', 'priceFrom', 'priceUnit', 'published'],
  faqs: ['q', 'a', 'published'],
};

let current = structuredClone(SEED);

function setPath(obj, p, v) {
  const keys = p.split('.');
  let o = obj;
  for (const k of keys.slice(0, -1)) { if (!o[k] || typeof o[k] !== 'object') o[k] = {}; o = o[k]; }
  o[keys[keys.length - 1]] = v;
}

/** Wczytuje zmiany z bazy i nakłada je na dane startowe. */
export async function loadCatalog() {
  const next = structuredClone(SEED);
  try {
    for (const row of await findAll('catalog')) {
      const item = next[row.kind]?.find((x) => x.slug === row.slug);
      if (!item) continue;
      for (const [k, v] of Object.entries(row.patch || {})) if (EDITABLE[row.kind]?.includes(k)) setPath(item, k, v);
    }
  } catch (e) { console.warn('[catalog]', e.message); }
  // ceny usług typu „od” bez kwoty pokazujemy jako wycenę
  for (const s of next.services) if (s.pricing && s.pricing.kind === 'from' && !s.pricing.amount) s.pricing.kind = 'quote';
  current = next;
  return current;
}

/** Zapisuje zmiany jednej pozycji oferty (tylko dozwolone pola). */
export async function saveCatalogItem(kind, slug, patch) {
  const allowed = EDITABLE[kind];
  const base = SEED[kind]?.find((x) => x.slug === slug);
  if (!allowed || !base) return null;
  const clean = {};
  for (const k of allowed) if (k in patch) clean[k] = patch[k];
  const prev = await col('catalog').findOne({ kind, slug });
  const merged = { ...(prev?.patch || {}), ...clean };
  await col('catalog').updateOne({ kind, slug }, { $set: { kind, slug, patch: merged, updated_at: nowIso() } }, { upsert: true });
  await loadCatalog();
  return current[kind].find((x) => x.slug === slug);
}

export async function resetCatalogItem(kind, slug) {
  await col('catalog').deleteOne({ kind, slug });
  await loadCatalog();
}

const byOrder = (a, b) => (a.order ?? 99) - (b.order ?? 99);
const pub = (arr) => arr.filter((x) => x.published !== false).sort(byOrder);

export const catalog = () => current;
export const services = () => pub(current.services);
export const packages = () => pub(current.packages);
export const plans = () => pub(current.plans);
export const faqs = () => pub(current.faqs);
export const service = (slug) => services().find((s) => s.slug === slug);
export const all = (kind) => [...(current[kind] || [])].sort(byOrder);

/** Tematy formularza kontaktowego (walidowane po stronie serwera). */
export function contactTopics() {
  return [
    'Bezpłatna wycena',
    ...packages().map((p) => `Pakiet ${p.name}`),
    ...plans().map((p) => p.name),
    ...services().map((s) => s.name),
    'Inny temat',
  ];
}

const nf = new Intl.NumberFormat('pl-PL');
export const pln = (v) => `${nf.format(v)} zł`;

/** Krótka etykieta ceny usługi, np. „od 1 490 zł netto” albo „wycena indywidualna”. */
export function servicePrice(s) {
  const p = s.pricing || {};
  if (p.kind === 'from' && p.amount) return `od ${pln(p.amount)} ${p.unit || 'netto'}`;
  return 'wycena indywidualna';
}
export function packagePrice(p) {
  return p.priceFrom ? { main: `od ${nf.format(p.priceFrom)}`, unit: `zł ${p.priceUnit || 'netto'}` } : { main: 'indywidualnie', unit: '' };
}
export function planPrice(p) {
  return p.priceFrom ? { main: `od ${nf.format(p.priceFrom)}`, unit: `zł ${p.priceUnit || 'netto / mies.'}` } : { main: 'wycena', unit: 'po rozmowie' };
}
