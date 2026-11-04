// Panel admina: edycja oferty (usługi, pakiety, abonamenty, FAQ). Zmiany od razu widać na stronie.
import { HttpError } from '../lib/http.js';
import { audit } from '../lib/audit.js';
import { KINDS, EDITABLE, all, saveCatalogItem, resetCatalogItem, createCatalogItem, canCreate, services, servicePrice, packagePrice, planPrice } from '../web/catalog.js';
import { slugify } from '../web/content.js';
import { findAll } from '../db/index.js';
import { route } from './router.js';

const A = { auth: 'admin' };

function row(kind, x, edited, custom) {
  const price = kind === 'services' ? servicePrice(x) : kind === 'packages' ? Object.values(packagePrice(x)).join(' ') : kind === 'plans' ? Object.values(planPrice(x)).join(' ') : '';
  return {
    kind, slug: x.slug, name: x.name || x.q, text: x.summary || x.description || x.audience || x.a || '',
    price: price.trim(), published: x.published !== false, featured: Boolean(x.featured), edited: edited.has(`${kind}:${x.slug}`), custom: custom.has(`${kind}:${x.slug}`), order: x.order ?? 99,
    fields: {
      name: x.name, summary: x.summary, intro: x.intro, audience: x.audience, description: x.description, q: x.q, a: x.a,
      priceFrom: x.priceFrom ?? null, priceUnit: x.priceUnit ?? '', amount: x.pricing?.amount ?? null, unit: x.pricing?.unit ?? '', note: x.pricing?.note ?? '',
      content: x.content ?? '', seoTitle: x.seo?.title ?? '', seoDescription: x.seo?.description ?? '',
      published: x.published !== false, featured: Boolean(x.featured), order: x.order ?? '', duration: x.duration ?? '', separateCosts: x.separateCosts ?? '', relatedService: x.relatedService ?? '',
      includes: (x.includes || []).join('\n'), limits: (x.limits || []).join('\n'), extensions: (x.extensions || []).join('\n'), features: (x.features || []).join('\n'), scope: (x.scope || []).join('\n'),
    },
  };
}

route('GET', '/api/admin/catalog', async () => {
  const rows = await findAll('catalog');
  const edited = new Set(rows.filter((r) => !r.custom).map((r) => `${r.kind}:${r.slug}`));
  const custom = new Set(rows.filter((r) => r.custom).map((r) => `${r.kind}:${r.slug}`));
  const out = {};
  for (const kind of Object.keys(KINDS)) out[kind] = all(kind).map((x) => row(kind, x, edited, custom));
  return { kinds: KINDS, items: out, services: services().map((s) => ({ value: s.slug, label: s.name })) };
}, A);

const str = (v, max) => String(v ?? '').trim().slice(0, max);
const num = (v) => (v === '' || v === null || v === undefined ? null : Math.max(0, Math.min(10_000_000, Math.round(Number(v)))));
const lines = (v) => String(v ?? '').split(/\r?\n/).map((x) => x.trim().slice(0, 300)).filter(Boolean).slice(0, 40);
const LIST_FIELDS = ['includes', 'limits', 'extensions', 'features', 'scope'];

/** Pola wspólne dla edycji i dodawania pozycji. */
function cleanFields(body) {
  const patch = {};
  for (const k of LIST_FIELDS) if (k in body) patch[k] = lines(body[k]);
  if ('duration' in body) patch.duration = str(body.duration, 120);
  if ('separateCosts' in body) patch.separateCosts = str(body.separateCosts, 400);
  if ('relatedService' in body) patch.relatedService = str(body.relatedService, 80);
  if ('order' in body) patch.order = num(body.order) ?? 50;
  return patch;
}

route('PATCH', '/api/admin/catalog/:kind/:slug', async ({ req, user, params, body }) => {
  const { kind, slug } = params;
  if (!EDITABLE[kind]) throw new HttpError(404, 'Nie znaleziono.');
  const patch = cleanFields(body);
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

route('POST', '/api/admin/catalog/:kind', async ({ req, user, params, body }) => {
  const { kind } = params;
  if (!canCreate(kind)) throw new HttpError(404, 'Tego typu pozycji nie można dodać w panelu.');
  const title = kind === 'faqs' ? str(body.q, 200) : str(body.name, 120);
  if (!title) throw new HttpError(422, kind === 'faqs' ? 'Pytanie jest wymagane.' : 'Nazwa jest wymagana.', { [kind === 'faqs' ? 'q' : 'name']: 'Wymagane' });
  const slug = slugify(body.slug || title);
  if (!slug) throw new HttpError(422, 'Nie udało się utworzyć adresu z tej nazwy.', { name: 'Zmień nazwę' });
  const data = { ...cleanFields(body), published: Boolean(body.published), featured: Boolean(body.featured) };
  if (kind === 'faqs') { data.q = title; data.a = str(body.a, 1500); } else data.name = title;
  if ('summary' in body) data.summary = str(body.summary, 400);
  if ('audience' in body) data.audience = str(body.audience, 300);
  if ('description' in body) data.description = str(body.description, 800);
  if ('priceFrom' in body) data.priceFrom = num(body.priceFrom);
  if ('priceUnit' in body) data.priceUnit = str(body.priceUnit, 40);
  const saved = await createCatalogItem(kind, slug, data);
  if (saved === false) throw new HttpError(409, 'Pozycja o takiej nazwie już istnieje.', { name: 'Zajęta' });
  audit(req, user, 'catalog.created', 'catalog', null, `${KINDS[kind]}: ${title}`);
  return { ok: true, slug };
}, { ...A, bodyLimit: 64 * 1024 });

route('DELETE', '/api/admin/catalog/:kind/:slug', async ({ req, user, params }) => {
  if (!EDITABLE[params.kind]) throw new HttpError(404, 'Nie znaleziono.');
  await resetCatalogItem(params.kind, params.slug);
  audit(req, user, 'catalog.reset', 'catalog', null, `${KINDS[params.kind]}: ${params.slug}`);
  return { ok: true };
}, A);
