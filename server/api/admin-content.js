// Panel admina: treści strony (cennik, blog, realizacje, opinie, strony lokalne) i meta SEO.
import { HttpError } from '../lib/http.js';
import { audit } from '../lib/audit.js';
import {
  SCHEMAS, contentAll, createContent, updateContent, deleteContent, ValidationError, saveSeoMeta, allSeoMeta, markdown, withoutOverrides,
} from '../web/content.js';
import { services } from '../web/catalog.js';
import { publicPages, renderPublicPath } from '../web/pages.js';
import { route, idParam } from './router.js';

const A = { auth: 'admin' };

function schemaFor(kind) {
  const s = SCHEMAS[kind];
  if (!s) throw new HttpError(404, 'Nie znaleziono typu treści.');
  return s;
}

/** Schemat dla formularza w panelu (z opcjami usług). */
function clientSchema(kind) {
  const s = schemaFor(kind);
  const svcOpts = services().map((x) => ({ value: x.slug, label: x.name }));
  return {
    kind, label: s.label, one: s.one, icon: s.icon, path: s.path,
    fields: s.fields.map((f) => ({ ...f, options: f.optionsFrom === 'services' ? svcOpts : f.options })),
  };
}

const wrap = async (fn) => {
  try { return await fn(); } catch (e) {
    if (e instanceof ValidationError) throw new HttpError(422, e.message, e.fields);
    throw e;
  }
};

route('GET', '/api/admin/content', () => ({
  kinds: Object.entries(SCHEMAS).map(([k, s]) => ({ kind: k, label: s.label, icon: s.icon, count: contentAll(k).length })),
}), A);

route('GET', '/api/admin/content/:kind', ({ params }) => ({ schema: clientSchema(params.kind), rows: contentAll(params.kind) }), A);

route('POST', '/api/admin/content/:kind', async ({ req, user, params, body }) => {
  const s = schemaFor(params.kind);
  const row = await wrap(() => createContent(params.kind, body));
  audit(req, user, 'content.created', params.kind, row.id, `${s.label}: ${row.title || row.name || row.h1 || row.author || ''}`);
  return { ok: true, row };
}, { ...A, bodyLimit: 256 * 1024 });

route('PATCH', '/api/admin/content/:kind/:id', async ({ req, user, params, body }) => {
  const s = schemaFor(params.kind);
  const row = await wrap(() => updateContent(params.kind, idParam(params.id), body));
  if (!row) throw new HttpError(404, 'Nie znaleziono wpisu.');
  audit(req, user, 'content.updated', params.kind, row.id, `${s.label}: ${row.title || row.name || row.h1 || row.author || ''}`);
  return { ok: true, row };
}, { ...A, bodyLimit: 256 * 1024 });

route('DELETE', '/api/admin/content/:kind/:id', async ({ req, user, params }) => {
  const s = schemaFor(params.kind);
  await deleteContent(params.kind, idParam(params.id));
  audit(req, user, 'content.deleted', params.kind, Number(params.id), s.label);
  return { ok: true };
}, A);

// Podgląd markdown w edytorze
route('POST', '/api/admin/markdown', ({ body }) => ({ html: markdown(String(body.text || '').slice(0, 60000)) }), { ...A, bodyLimit: 256 * 1024 });

// ---------- SEO: meta wszystkich podstron ----------
const pick = (html, re) => (html.match(re) || [])[1] || '';
const unesc = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Domyślne (wygenerowane) title i description strony — bez nadpisań z panelu. */
function defaultsFor(path) {
  const html = withoutOverrides(() => renderPublicPath(path));
  if (!html) return { title: '', description: '' };
  return {
    title: unesc(pick(html, /<title>([^<]*)<\/title>/)),
    description: unesc(pick(html, /<meta name="description" content="([^"]*)"/)),
  };
}

route('GET', '/api/admin/seo', () => {
  const over = new Map(allSeoMeta().map((m) => [m.path, m]));
  const pages = publicPages().map((p) => ({ path: p.path, name: p.name, ...defaultsFor(p.path), override: over.get(p.path) || null }));
  for (const m of over.values()) if (!pages.some((p) => p.path === m.path)) pages.push({ path: m.path, name: m.path, ...defaultsFor(m.path), override: m });
  return { pages };
}, A);

route('PUT', '/api/admin/seo', async ({ req, user, body }) => {
  const path = String(body.path || '');
  if (!/^\/[a-z0-9/_-]*$/.test(path)) throw new HttpError(422, 'Niepoprawna ścieżka.');
  await wrap(() => saveSeoMeta(path, body));
  audit(req, user, 'seo.updated', 'seo', null, path);
  return { ok: true };
}, A);
