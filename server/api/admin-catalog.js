// Panel admina: edycja oferty (usługi, pakiety, abonamenty, FAQ). Zmiany od razu widać na stronie.
import { HttpError } from '../lib/http.js';
import { audit } from '../lib/audit.js';
import { KINDS, EDITABLE, all, saveCatalogItem, resetCatalogItem, servicePrice, packagePrice, planPrice } from '../web/catalog.js';
import { findAll } from '../db/index.js';
import { route } from './router.js';

const A = { auth: 'admin' };

function row(kind, x, edited) {
  const price = kind === 'services' ? servicePrice(x) : kind === 'packages' ? Object.values(packagePrice(x)).join(' ') : kind === 'plans' ? Object.values(planPrice(x)).join(' ') : '';
  return {
    kind, slug: x.slug, name: x.name || x.q, text: x.summary || x.description || x.audience || x.a || '',
    price: price.trim(), published: x.published !== false, featured: Boolean(x.featured), edited: edited.has(`${kind}:${x.slug}`),
    fields: {
      name: x.name, summary: x.summary, intro: x.intro, audience: x.audience, description: x.description, q: x.q, a: x.a,
      priceFrom: x.priceFrom ?? null, priceUnit: x.priceUnit ?? '', amount: x.pricing?.amount ?? null, unit: x.pricing?.unit ?? '', note: x.pricing?.note ?? '',
      content: x.content ?? '', seoTitle: x.seo?.title ?? '', seoDescription: x.seo?.description ?? '',
      published: x.published !== false, featured: Boolean(x.featured),
    },
  };
}

route('GET', '/api/admin/catalog', async () => {
  const edited = new Set((await findAll('catalog')).map((r) => `${r.kind}:${r.slug}`));
  const out = {};
  for (const kind of Object.keys(KINDS)) out[kind] = all(kind).map((x) => row(kind, x, edited));
  return { kinds: KINDS, items: out };
}, A);

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const num = (v) => (v === '' || v === null || v === undefined ? null : Math.max(0, Math.min(10_000_000, Math.round(Number(v)))));

route('PATCH', '/api/admin/catalog/:kind/:slug', async ({ req, user, params, body }) => {
  const { kind, slug } = params;
  if (!EDITABLE[kind]) throw new HttpError(404, 'Nie znaleziono.');
  const patch = {};
  if ('name' in body && kind !== 'faqs') { patch.name = str(body.name, 120); if (!patch.name) throw new HttpError(422, 'Nazwa jest wymagana.', { name: 'Wymagane' }); }
  if ('summary' in body) patch.summary = str(body.summary, 400);
  if ('intro' in body) patch.intro = str(body.intro, 1500);
  if ('audience' in body) patch.audience = str(body.audience, 300);
  if ('description' in body) patch.description = str(body.description, 800);
  if ('priceFrom' in body) { const n = num(body.priceFrom); if (Number.isNaN(n)) throw new HttpError(422, 'Cena musi być liczbą.', { priceFrom: 'Liczba' }); patch.priceFrom = n; }
  if ('priceUnit' in body) patch.priceUnit = str(body.priceUnit, 40);
  if ('amount' in body) { const n = num(body.amount); if (Number.isNaN(n)) throw new HttpError(422, 'Cena musi być liczbą.', { amount: 'Liczba' }); patch['pricing.amount'] = n; }
  if ('note' in body) patch['pricing.note'] = str(body.note, 400);
  if ('unit' in body) patch['pricing.unit'] = str(body.unit, 40);
  if ('content' in body) patch.content = str(body.content, 60000);
  if ('seoTitle' in body) patch['seo.title'] = str(body.seoTitle, 90);
  if ('seoDescription' in body) patch['seo.description'] = str(body.seoDescription, 220);
  if ('q' in body) patch.q = str(body.q, 200);
  if ('a' in body) patch.a = str(body.a, 1500);
  if ('published' in body) patch.published = Boolean(body.published);
  if ('featured' in body) patch.featured = Boolean(body.featured);
  const saved = await saveCatalogItem(kind, slug, patch);
  if (!saved) throw new HttpError(404, 'Nie znaleziono pozycji oferty.');
  audit(req, user, 'catalog.updated', 'catalog', null, `${KINDS[kind]}: ${saved.name || saved.q}`);
  return { ok: true };
}, { ...A, bodyLimit: 256 * 1024 });

route('DELETE', '/api/admin/catalog/:kind/:slug', async ({ req, user, params }) => {
  if (!EDITABLE[params.kind]) throw new HttpError(404, 'Nie znaleziono.');
  await resetCatalogItem(params.kind, params.slug);
  audit(req, user, 'catalog.reset', 'catalog', null, `${KINDS[params.kind]}: ${params.slug}`);
  return { ok: true };
}, A);
