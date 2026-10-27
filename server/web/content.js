// =====================================================================
//  Treści strony zarządzane w panelu admina:
//  cennik pojedynczych usług, blog, realizacje, opinie, strony lokalne
//  i nadpisania meta SEO. Wszystko w MongoDB, w pamięci podręcznej
//  serwera (strony renderują się synchronicznie).
//
//  Dane startowe (server/data/content-seed.js) trafiają do bazy tylko raz
//  dla każdego typu — usunięcie wszystkich wpisów nie przywróci ich ponownie.
// =====================================================================
import { findAll, findOne, insert, update, remove, col, nowIso } from '../db/index.js';
import { SEED } from '../data/content-seed.js';

const CITY_OPTIONS = ['Słupsk', 'Ustka', 'Lębork', 'Bytów', 'Miastko', 'Pomorze'].map((v) => ({ value: v, label: v }));

/**
 * Definicje typów treści. Pola:
 *  type: text | textarea | md (markdown) | number | checkbox | select | date | lines (lista, jedna pozycja w linii)
 *  list: pokazywane w tabeli panelu
 */
export const SCHEMAS = {
  price_items: {
    label: 'Cennik usług', one: 'pozycję cennika', collection: 'price_items', icon: 'receipt-text', path: '/cennik',
    sort: { order: 1 },
    fields: [
      { name: 'name', label: 'Nazwa pozycji *', type: 'text', max: 140, required: true, list: true },
      { name: 'service', label: 'Usługa (sekcja cennika)', type: 'select', optionsFrom: 'services', list: true },
      { name: 'price', label: 'Cena „od” (zł netto) — puste = wycena indywidualna', type: 'number' },
      { name: 'unit', label: 'Jednostka', type: 'text', max: 40, placeholder: 'np. netto, netto / mies., netto / godz.' },
      { name: 'note', label: 'Krótki opis / co obejmuje', type: 'textarea', max: 400, rows: 2 },
      { name: 'order', label: 'Kolejność (mniejsza = wyżej)', type: 'number' },
      { name: 'popular', label: 'Wyróżnij jako „często wybierane”', type: 'checkbox' },
      { name: 'published', label: 'Widoczna na stronie', type: 'checkbox', default: true },
    ],
  },
  posts: {
    label: 'Blog', one: 'wpis', collection: 'posts', icon: 'book-open', path: '/blog', slugFrom: 'title',
    sort: { published_at: -1 },
    fields: [
      { name: 'title', label: 'Tytuł (H1) *', type: 'text', max: 160, required: true, list: true },
      { name: 'slug', label: 'Adres (slug) — puste = z tytułu', type: 'text', max: 90, help: 'Małe litery, bez polskich znaków, np. ile-kosztuje-strona' },
      { name: 'category', label: 'Kategoria', type: 'select', options: ['SEO', 'Reklamy Google i Meta', 'Strony WWW', 'AI i automatyzacje', 'Social media', 'Marketing lokalny'].map((v) => ({ value: v, label: v })), list: true },
      { name: 'excerpt', label: 'Zajawka (lista wpisów, meta description)', type: 'textarea', max: 300, rows: 2 },
      { name: 'body', label: 'Treść', type: 'md', rows: 18, max: 60000 },
      { name: 'services', label: 'Powiązane usługi (slugi, jeden w linii) — linkowanie wewnętrzne', type: 'lines', rows: 2 },
      { name: 'author', label: 'Autor', type: 'text', max: 80 },
      { name: 'published_at', label: 'Data publikacji', type: 'date' },
      { name: 'seo_title', label: 'Title SEO (do ~60 znaków) — puste = tytuł', type: 'text', max: 90, counter: 60 },
      { name: 'seo_description', label: 'Meta description (do ~155 znaków) — puste = zajawka', type: 'textarea', max: 220, rows: 2, counter: 155 },
      { name: 'og_image', label: 'Obrazek OG (adres URL) — puste = domyślny', type: 'text', max: 300 },
      { name: 'published', label: 'Opublikowany', type: 'checkbox', default: false },
    ],
  },
  cases: {
    label: 'Realizacje', one: 'realizację', collection: 'cases', icon: 'folder-kanban', path: '/realizacje', slugFrom: 'title',
    sort: { order: 1 },
    fields: [
      { name: 'title', label: 'Tytuł realizacji *', type: 'text', max: 160, required: true, list: true },
      { name: 'slug', label: 'Adres (slug) — puste = z tytułu', type: 'text', max: 90 },
      { name: 'client', label: 'Klient / marka', type: 'text', max: 120, list: true },
      { name: 'industry', label: 'Branża', type: 'text', max: 80 },
      { name: 'city', label: 'Miasto', type: 'text', max: 80 },
      { name: 'url', label: 'Adres strony klienta (https://…)', type: 'text', max: 200 },
      { name: 'summary', label: 'Krótki opis (karta)', type: 'textarea', max: 300, rows: 2 },
      { name: 'problem', label: 'Problem / punkt wyjścia', type: 'md', rows: 4, max: 4000 },
      { name: 'solution', label: 'Co zrobiliśmy', type: 'md', rows: 6, max: 8000 },
      { name: 'results', label: 'Wyniki w liczbach (jeden w linii: Etykieta | wartość). Tylko prawdziwe dane!', type: 'lines', rows: 4 },
      { name: 'services', label: 'Usługi (slugi, jeden w linii)', type: 'lines', rows: 3 },
      { name: 'order', label: 'Kolejność', type: 'number' },
      { name: 'published', label: 'Opublikowana', type: 'checkbox', default: false },
    ],
  },
  reviews: {
    label: 'Opinie', one: 'opinię', collection: 'reviews', icon: 'quote', path: '/opinie',
    sort: { date: -1 },
    fields: [
      { name: 'author', label: 'Autor *', type: 'text', max: 100, required: true, list: true },
      { name: 'company', label: 'Firma', type: 'text', max: 120, list: true },
      { name: 'city', label: 'Miasto', type: 'text', max: 60 },
      { name: 'rating', label: 'Ocena (1–5)', type: 'number', min: 1, max: 5 },
      { name: 'text', label: 'Treść opinii *', type: 'textarea', max: 2000, rows: 5, required: true },
      { name: 'source', label: 'Źródło', type: 'select', options: [{ value: 'google', label: 'Google' }, { value: 'facebook', label: 'Facebook' }, { value: 'bezposrednio', label: 'Bezpośrednio od klienta' }] },
      { name: 'source_url', label: 'Link do opinii (np. w Google)', type: 'text', max: 400 },
      { name: 'date', label: 'Data', type: 'date' },
      { name: 'published', label: 'Widoczna na stronie', type: 'checkbox', default: true },
    ],
  },
  locals: {
    label: 'Strony lokalne', one: 'stronę lokalną', collection: 'locals', icon: 'map-pin', path: '', slugFrom: 'h1',
    sort: { order: 1 },
    fields: [
      { name: 'h1', label: 'Nagłówek H1 *', type: 'text', max: 120, required: true, list: true },
      { name: 'slug', label: 'Adres (slug) *', type: 'text', max: 90, required: true, help: 'np. agencja-marketingowa-slupsk', list: true },
      { name: 'city', label: 'Miasto', type: 'select', options: CITY_OPTIONS },
      { name: 'service', label: 'Główna usługa', type: 'select', optionsFrom: 'services', empty: 'Cała oferta (agencja)' },
      { name: 'lead', label: 'Wstęp pod nagłówkiem', type: 'textarea', max: 500, rows: 3 },
      { name: 'body', label: 'Treść (unikalna dla miasta!)', type: 'md', rows: 16, max: 30000 },
      { name: 'faq', label: 'FAQ (jedno w linii: Pytanie | Odpowiedź)', type: 'lines', rows: 4 },
      { name: 'seo_title', label: 'Title SEO (do ~60 znaków)', type: 'text', max: 90, counter: 60 },
      { name: 'seo_description', label: 'Meta description (do ~155 znaków)', type: 'textarea', max: 220, rows: 2, counter: 155 },
      { name: 'order', label: 'Kolejność', type: 'number' },
      { name: 'published', label: 'Opublikowana', type: 'checkbox', default: true },
    ],
  },
};

// ---------------------------------------------------------------------
// Pamięć podręczna
// ---------------------------------------------------------------------
const cache = Object.fromEntries(Object.keys(SCHEMAS).map((k) => [k, []]));
let seoMeta = new Map(); // ścieżka → { title, description, og_image, noindex }

const sorter = (spec) => (a, b) => {
  for (const [k, dir] of Object.entries(spec)) {
    const x = a[k] ?? (typeof b[k] === 'number' ? 999 : ''), y = b[k] ?? (typeof a[k] === 'number' ? 999 : '');
    if (x < y) return -dir;
    if (x > y) return dir;
  }
  return (a.id || 0) - (b.id || 0);
};

export async function loadContent(kind) {
  const kinds = kind ? [kind] : Object.keys(SCHEMAS);
  for (const k of kinds) {
    const rows = await findAll(SCHEMAS[k].collection);
    cache[k] = rows.sort(sorter(SCHEMAS[k].sort));
  }
  if (!kind) seoMeta = new Map((await findAll('seo_meta')).map((r) => [r.path, r]));
}

/** Jednorazowe wgranie danych startowych (osobno dla każdego typu). */
export async function seedContent() {
  for (const [kind, s] of Object.entries(SCHEMAS)) {
    const flagKey = `seeded_${kind}`;
    if (await col('settings').findOne({ key: flagKey })) continue;
    const existing = await col(s.collection).countDocuments({});
    if (!existing) {
      for (const row of SEED[kind] || []) await insert(s.collection, { ...normalizeDefaults(kind, row), created_at: nowIso(), updated_at: nowIso() });
      if ((SEED[kind] || []).length) console.log(`  [content] Dodano dane startowe: ${s.label} (${SEED[kind].length})`);
    }
    await col('settings').updateOne({ key: flagKey }, { $set: { key: flagKey, value: '1' } }, { upsert: true });
  }
}

function normalizeDefaults(kind, row) {
  const out = { ...row };
  for (const f of SCHEMAS[kind].fields) if (out[f.name] === undefined && f.default !== undefined) out[f.name] = f.default;
  return out;
}

// ---------------------------------------------------------------------
// Odczyt (strona publiczna)
// ---------------------------------------------------------------------
const pub = (arr) => arr.filter((x) => x.published !== false);
export const contentAll = (kind) => cache[kind] || [];
export const priceItems = () => pub(cache.price_items);
export const posts = () => pub(cache.posts).filter((p) => !p.published_at || p.published_at <= new Date().toISOString().slice(0, 10));
export const post = (slug) => posts().find((p) => p.slug === slug);
export const cases = () => pub(cache.cases);
export const caseBySlug = (slug) => cases().find((c) => c.slug === slug);
export const reviews = () => pub(cache.reviews);
export const locals = () => pub(cache.locals);
export const localBySlug = (slug) => locals().find((l) => l.slug === slug);
let ignoreOverrides = false;
export const seoFor = (path) => (ignoreOverrides ? undefined : seoMeta.get(path));
export function withoutOverrides(fn) { ignoreOverrides = true; try { return fn(); } finally { ignoreOverrides = false; } }
export const allSeoMeta = () => [...seoMeta.values()];

/** Najniższa cena „od” dla usługi (z cennika). */
export function minItemPrice(serviceSlug) {
  const list = priceItems().filter((i) => (!serviceSlug || i.service === serviceSlug) && Number(i.price) > 0 && !/mies|godz/.test(i.unit || ''));
  return list.length ? Math.min(...list.map((i) => Number(i.price))) : null;
}

/** "Etykieta | wartość" → [etykieta, wartość] */
export const pairs = (lines) => (lines || []).map((l) => String(l).split('|').map((x) => x.trim())).filter((p) => p[0]);

// ---------------------------------------------------------------------
// Zapis (panel admina)
// ---------------------------------------------------------------------
export function slugify(s) {
  const map = { ą: 'a', ć: 'c', ę: 'e', ł: 'l', ń: 'n', ó: 'o', ś: 's', ź: 'z', ż: 'z' };
  return String(s || '').toLowerCase().replace(/[ąćęłńóśźż]/g, (c) => map[c]).normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
}

export class ValidationError extends Error {
  constructor(message, fields) { super(message); this.fields = fields; }
}

/** Czyści dane z formularza według schematu. partial = PATCH (tylko przesłane pola). */
export function cleanInput(kind, body, { partial = false } = {}) {
  const s = SCHEMAS[kind];
  const out = {};
  for (const f of s.fields) {
    if (!(f.name in body)) {
      if (!partial && f.default !== undefined) out[f.name] = f.default;
      continue;
    }
    const v = body[f.name];
    switch (f.type) {
      case 'number': {
        if (v === '' || v === null || v === undefined) { out[f.name] = null; break; }
        const n = Number(v);
        if (!Number.isFinite(n)) throw new ValidationError(`${f.label.replace(/\s*[*—(].*$/, '')}: podaj liczbę.`, { [f.name]: 'Liczba' });
        out[f.name] = Math.max(f.min ?? 0, Math.min(f.max ?? 100_000_000, Math.round(n * 100) / 100));
        break;
      }
      case 'checkbox': out[f.name] = v === true || v === 'on' || v === '1' || v === 1; break;
      case 'date': out[f.name] = /^\d{4}-\d{2}-\d{2}$/.test(String(v)) ? String(v) : ''; break;
      case 'lines': {
        const arr = Array.isArray(v) ? v : String(v || '').split(/\r?\n/);
        out[f.name] = arr.map((x) => String(x).trim().slice(0, 400)).filter(Boolean).slice(0, 40);
        break;
      }
      default: out[f.name] = String(v ?? '').trim().slice(0, f.max || 1000);
    }
    if (f.required && (out[f.name] === '' || out[f.name] === null)) throw new ValidationError(`Pole „${f.label.replace(/\s*[*—(].*$/, '')}” jest wymagane.`, { [f.name]: 'Wymagane' });
  }
  if ('slug' in out || (!partial && s.fields.some((f) => f.name === 'slug'))) {
    const src = out.slug || (s.slugFrom ? out[s.slugFrom] || body[s.slugFrom] : '');
    if ('slug' in out || !partial) out.slug = slugify(src);
    if (s.fields.some((f) => f.name === 'slug') && !out.slug) throw new ValidationError('Podaj adres (slug) lub tytuł.', { slug: 'Wymagane' });
  }
  for (const k of ['url', 'source_url', 'og_image']) {
    if (out[k] && !/^(https?:\/\/|\/)/.test(out[k])) throw new ValidationError('Adres musi zaczynać się od https:// lub /.', { [k]: 'Niepoprawny adres' });
  }
  return out;
}

async function ensureUniqueSlug(kind, slug, id) {
  if (!slug) return;
  const other = await findOne(SCHEMAS[kind].collection, { slug });
  if (other && other.id !== id) throw new ValidationError('Taki adres już istnieje — zmień slug.', { slug: 'Zajęty' });
}

export async function createContent(kind, body) {
  const data = cleanInput(kind, body);
  await ensureUniqueSlug(kind, data.slug);
  if (kind === 'posts' && data.published && !data.published_at) data.published_at = new Date().toISOString().slice(0, 10);
  const row = await insert(SCHEMAS[kind].collection, { ...data, created_at: nowIso(), updated_at: nowIso() });
  await loadContent(kind);
  return row;
}

export async function updateContent(kind, id, body) {
  const s = SCHEMAS[kind];
  const prev = await findOne(s.collection, { id });
  if (!prev) return null;
  const data = cleanInput(kind, body, { partial: true });
  await ensureUniqueSlug(kind, data.slug, id);
  if (kind === 'posts' && data.published && !prev.published_at && !data.published_at) data.published_at = new Date().toISOString().slice(0, 10);
  await update(s.collection, { id }, { ...data, updated_at: nowIso() });
  await loadContent(kind);
  return { ...prev, ...data };
}

export async function deleteContent(kind, id) {
  await remove(SCHEMAS[kind].collection, { id });
  await loadContent(kind);
}

export async function saveSeoMeta(path, patch) {
  const clean = {
    path,
    title: String(patch.title || '').trim().slice(0, 90),
    description: String(patch.description || '').trim().slice(0, 220),
    og_image: String(patch.og_image || '').trim().slice(0, 300),
    noindex: Boolean(patch.noindex),
    updated_at: nowIso(),
  };
  if (clean.og_image && !/^(https?:\/\/|\/)/.test(clean.og_image)) throw new ValidationError('Obrazek OG: adres musi zaczynać się od https:// lub /.', { og_image: 'Niepoprawny adres' });
  if (!clean.title && !clean.description && !clean.og_image && !clean.noindex) await col('seo_meta').deleteOne({ path });
  else await col('seo_meta').updateOne({ path }, { $set: clean }, { upsert: true });
  seoMeta = new Map((await findAll('seo_meta')).map((r) => [r.path, r]));
}

// ---------------------------------------------------------------------
// Markdown (bezpieczny podzbiór): ## nagłówki, akapity, listy, **pogrubienie**,
// *kursywa*, [link](url), > cytat, tabele | a | b |
// ---------------------------------------------------------------------
const escHtml = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function inline(s) {
  let t = escHtml(s);
  t = t.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/(^|[\s(])\*(?!\s)(.+?)\*(?=[\s).,;:!?]|$)/g, '$1<em>$2</em>');
  t = t.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (m, label, href) => {
    const raw = href.replace(/&amp;/g, '&');
    if (!/^(https?:\/\/|\/|#|mailto:|tel:)/.test(raw)) return label;
    const ext = /^https?:\/\//.test(raw);
    return `<a href="${href}"${ext ? ' target="_blank" rel="noopener"' : ''}>${label}</a>`;
  });
  return t;
}

export function markdown(src) {
  const lines = String(src || '').replace(/\r/g, '').split('\n');
  const out = [];
  let para = [], list = null, table = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<${list.tag}>${list.items.map((i) => `<li>${inline(i)}</li>`).join('')}</${list.tag}>`); list = null; } };
  const flushTable = () => {
    if (!table) return;
    const rows = table.filter((r) => !/^\s*\|?\s*:?-{2,}/.test(r)).map((r) => r.replace(/^\s*\||\|\s*$/g, '').split('|').map((c) => c.trim()));
    const [head, ...body] = rows;
    out.push(`<div class="md-table"><table><thead><tr>${head.map((c) => `<th>${inline(c)}</th>`).join('')}</tr></thead><tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`);
    table = null;
  };
  const flush = () => { flushPara(); flushList(); flushTable(); };
  for (const line of lines) {
    const t = line.trim();
    if (!t) { flush(); continue; }
    let m;
    if ((m = t.match(/^(#{2,4})\s+(.+)$/))) { flush(); const lvl = m[1].length; const id = slugify(m[2]); out.push(`<h${lvl} id="${id}">${inline(m[2])}</h${lvl}>`); continue; }
    if (t.startsWith('|')) { flushPara(); flushList(); (table ||= []).push(t); continue; }
    if ((m = t.match(/^[-*]\s+(.+)$/))) { flushPara(); flushTable(); if (!list || list.tag !== 'ul') { flushList(); list = { tag: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = t.match(/^\d+[.)]\s+(.+)$/))) { flushPara(); flushTable(); if (!list || list.tag !== 'ol') { flushList(); list = { tag: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = t.match(/^>\s?(.*)$/))) { flush(); out.push(`<blockquote><p>${inline(m[1])}</p></blockquote>`); continue; }
    flushList(); flushTable();
    para.push(t);
  }
  flush();
  return out.join('\n');
}

/** Spis treści z nagłówków ## */
export function toc(src) {
  return String(src || '').split('\n').map((l) => l.trim().match(/^##\s+(.+)$/)).filter(Boolean).map((m) => ({ id: slugify(m[1]), text: m[1].replace(/\*\*/g, '') }));
}

/** Czysty tekst (np. do liczenia słów i czasu czytania). */
export const plainText = (src) => String(src || '').replace(/[#>*|_`-]/g, ' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/\s+/g, ' ').trim();
