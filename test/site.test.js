// Testy całej aplikacji na bazie w pamięci: uruchamiają prawdziwy serwer i sprawdzają strony, SEO i panel admina.
import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { totpCode, verifyTotp, generateTotpSecret } from '../server/lib/totp.js';

const PORT = 3977;
const BASE = `http://localhost:${PORT}`;
const PIN = '12345678';
const HEADERS = { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' };
let server;

before(async () => {
  server = spawn(process.execPath, ['server/index.js'], {
    env: { ...process.env, PORT: String(PORT), ADMIN_PIN: PIN, MONGO_URL: '', MONGODB_URI: '', MONGO_PUBLIC_URL: '', NODE_ENV: 'test', SEED_DEMO: 'true', TRUST_PROXY: 'true', SITE_URL: '', RAILWAY_ENVIRONMENT: '', RAILWAY_PROJECT_ID: '' },
    stdio: 'pipe',
  });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${BASE}/healthz`)).ok) return; } catch { /* serwer jeszcze wstaje */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('Serwer nie wystartował.');
});
after(() => server?.kill());

const get = (p, opts) => fetch(BASE + p, { redirect: 'manual', ...opts });
const tag = (html, re) => (html.match(re) || [])[1] || '';
const sitemap = async () => [...(await (await get('/sitemap.xml')).text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(BASE, ''));

async function adminCookie() {
  const res = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ pin: PIN }) });
  assert.equal(res.status, 200);
  return res.headers.getSetCookie().map((c) => c.split(';')[0]).join('; ');
}

test('każdy adres z sitemapy działa i ma komplet meta', async () => {
  const urls = await sitemap();
  assert.ok(urls.length > 40, `za mało adresów: ${urls.length}`);
  const titles = new Map();
  for (const u of urls) {
    const res = await get(u);
    assert.equal(res.status, 200, u);
    const html = await res.text();
    const title = tag(html, /<title>([^<]*)<\/title>/);
    assert.ok(title, `brak title: ${u}`);
    assert.ok(tag(html, /<meta name="description" content="([^"]*)"/), `brak description: ${u}`);
    assert.equal(tag(html, /<link rel="canonical" href="([^"]*)"/), `${BASE}${u}`, `canonical: ${u}`);
    assert.equal((html.match(/<h1[\s>]/g) || []).length, 1, `liczba H1: ${u}`);
    assert.doesNotMatch(html, /name="robots" content="noindex/, `noindex w sitemapie: ${u}`);
    assert.doesNotMatch(html, /\{\{[A-Z_]+\}\}/, `niewypełniony szablon: ${u}`);
    assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, `fonty z Google: ${u}`);
    assert.ok(!titles.has(title), `powtórzony title: ${u} i ${titles.get(title)}`);
    titles.set(title, u);
  }
});

test('wewnętrzne linki prowadzą do istniejących stron', async () => {
  const urls = await sitemap();
  const seen = new Set();
  for (const u of urls) {
    const html = await (await get(u)).text();
    for (const m of html.matchAll(/href="(\/[^"#?]*)/g)) seen.add(m[1]);
  }
  for (const link of seen) {
    if (/^\/(api|panel|admin)\b/.test(link) || link.startsWith('/assets/')) continue;
    const res = await get(link);
    assert.ok([200, 301, 302].includes(res.status), `martwy link ${link}: ${res.status}`);
  }
});

test('wszystkie użyte ikony są w sprite', () => {
  const sprite = fs.readFileSync('public/assets/icons.svg', 'utf8');
  const have = new Set([...sprite.matchAll(/symbol id="([a-z0-9-]+)"/g)].map((m) => m[1]));
  const files = ['server/web/pages.js', 'server/web/pages-extra.js', 'public/assets/js/admin.js', 'views/admin/app.html', 'views/partials/header.html'];
  const missing = new Set();
  for (const f of files) {
    for (const m of fs.readFileSync(f, 'utf8').matchAll(/(?:\bI\('|\bicon\('|data-lucide=")([a-z][a-z0-9-]+)/g)) if (!have.has(m[1])) missing.add(`${f}: ${m[1]}`);
  }
  assert.deepEqual([...missing], []);
});

test('cienkie strony nie są indeksowane', async () => {
  const urls = await sitemap();
  assert.ok(!urls.includes('/opinie'));
  assert.match(await (await get('/opinie')).text(), /name="robots" content="noindex, follow"/);
});

test('sitemap nie podaje daty uruchomienia serwera jako daty zmiany', async () => {
  const xml = await (await get('/sitemap.xml')).text();
  assert.match(xml, /<url><loc>[^<]+\/<\/loc><priority>1\.0<\/priority><\/url>/);
});

test('błędny adres to 404, a nie błąd serwera', async () => {
  assert.equal((await fetch(`${BASE}/%E0%A4%A`)).status, 404);
  assert.equal((await get('/nie-ma-takiej-strony')).status, 404);
  assert.equal((await get('/branze/nie-ma')).status, 404);
  assert.equal((await get('/../../etc/passwd')).status, 404);
});

test('strony prawne nie mają dopisku o wzorze', async () => {
  for (const p of ['/regulamin', '/polityka-prywatnosci']) assert.doesNotMatch(await (await get(p)).text(), /Wzór do uzupełnienia/);
});

test('oferta zawiera nowe pakiety i abonamenty', async () => {
  const pk = await (await get('/pakiety')).text();
  for (const n of ['LOKALNY START', 'SEZON', 'SKLEP START', 'PANEL DLA FIRMY']) assert.match(pk, new RegExp(n));
  const pl = await (await get('/abonamenty')).text();
  for (const n of ['Widoczność lokalna', 'Opieka nad stroną PLUS', 'Marketing lokalny kompleksowo', 'Asystent zapytań', 'Utrzymanie panelu firmy']) assert.match(pl, new RegExp(n));
});

test('zaplanowany wpis nie pojawia się przed datą publikacji', async () => {
  assert.equal((await get('/blog/rezerwacje-bezposrednie-strona-pensjonatu')).status, new Date().toISOString().slice(0, 10) >= '2026-12-16' ? 200 : 404);
});

test('lead zapisuje pochodzenie i termin kontaktu', async () => {
  const res = await fetch(`${BASE}/api/contact`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ name: 'Test Klient', email: 'test@example.com', message: 'Wiadomość testowa do formularza.', consent: true, utm: 'google', utmCampaign: 'zima', landing: '/branze/gastronomia' }) });
  assert.equal(res.status, 200);
  const cookie = await adminCookie();
  const { leads } = await (await fetch(`${BASE}/api/admin/leads`, { headers: { cookie } })).json();
  const lead = leads.find((l) => l.email === 'test@example.com');
  assert.equal(lead.landingPage, '/branze/gastronomia');
  assert.equal(lead.utmCampaign, 'zima');
  const patched = await fetch(`${BASE}/api/admin/leads/${lead.id}`, { method: 'PATCH', headers: { ...HEADERS, cookie }, body: JSON.stringify({ followUp: '2030-01-15' }) });
  assert.equal(patched.status, 200);
  const overview = await (await fetch(`${BASE}/api/admin/overview`, { headers: { cookie } })).json();
  assert.ok(overview.followUps.some((l) => l.id === lead.id));
});

test('panel: dodanie, edycja, publikacja i usunięcie własnego pakietu', async () => {
  const cookie = await adminCookie();
  const h = { ...HEADERS, cookie };
  const created = await fetch(`${BASE}/api/admin/catalog/packages`, { method: 'POST', headers: h, body: JSON.stringify({ name: 'Pakiet Testowy', priceFrom: 1234, includes: 'Punkt A\nPunkt B', published: false }) });
  assert.equal(created.status, 200);
  const { slug } = await created.json();
  assert.doesNotMatch(await (await get('/pakiety')).text(), /Pakiet Testowy/);
  const edited = await fetch(`${BASE}/api/admin/catalog/packages/${slug}`, { method: 'PATCH', headers: h, body: JSON.stringify({ published: true, includes: 'Punkt A\nPunkt C' }) });
  assert.equal(edited.status, 200);
  const page = await (await get('/pakiety')).text();
  assert.match(page, /Pakiet Testowy/);
  assert.match(page, /Punkt C/);
  assert.equal((await fetch(`${BASE}/api/admin/catalog/packages`, { method: 'POST', headers: h, body: JSON.stringify({ name: 'Pakiet Testowy' }) })).status, 409);
  assert.equal((await fetch(`${BASE}/api/admin/catalog/packages/${slug}`, { method: 'DELETE', headers: h, body: '{}' })).status, 200);
  assert.doesNotMatch(await (await get('/pakiety')).text(), /Pakiet Testowy/);
});

test('panel: lista gotowości pokazuje braki bez zmyślania danych', async () => {
  const cookie = await adminCookie();
  const r = await (await fetch(`${BASE}/api/admin/readiness`, { headers: { cookie } })).json();
  assert.ok(r.total > 10);
  const phone = r.groups.flatMap((g) => g.items).find((i) => i.label === 'Telefon na stronie');
  assert.equal(phone.ok, false);
});

test('API panelu odrzuca niezalogowanych', async () => {
  for (const p of ['/api/admin/readiness', '/api/admin/catalog', '/api/admin/leads']) assert.equal((await get(p)).status, 401, p);
});

test('kod TOTP zgodny z wektorem RFC 6238', () => {
  // Sekret "12345678901234567890" w base32, czas 59 s → 287082 (6 cyfr)
  assert.equal(totpCode('GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ', 59_000), '287082');
  const secret = generateTotpSecret();
  assert.ok(verifyTotp(secret, totpCode(secret)));
  assert.ok(!verifyTotp(secret, 'abcdef'));
});

test('zaufane urządzenie loguje się mimo globalnej blokady', async () => {
  const first = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: HEADERS, body: JSON.stringify({ pin: PIN }) });
  const device = first.headers.getSetCookie().find((c) => c.startsWith('velio_admin_device='));
  assert.ok(device, 'brak ciasteczka urządzenia');
  const cookie = device.split(';')[0];
  // 30 błędnych prób z różnych adresów uruchamia blokadę globalną
  for (let i = 0; i < 30; i++) await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { ...HEADERS, 'X-Forwarded-For': `10.1.${i}.1` }, body: JSON.stringify({ pin: '00000000' }) });
  const locked = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { ...HEADERS, 'X-Forwarded-For': '10.2.0.1' }, body: JSON.stringify({ pin: PIN }) });
  const trusted = await fetch(`${BASE}/api/admin/login`, { method: 'POST', headers: { ...HEADERS, cookie, 'X-Forwarded-For': '10.2.0.2' }, body: JSON.stringify({ pin: PIN }) });
  assert.equal(trusted.status, 200, 'zaufane urządzenie powinno wejść');
  assert.equal(locked.status, 429, 'obcy adres powinien być zablokowany');
});

test('formularz wyceny ma komunikat, że pakiet to tylko propozycja', async () => {
  const html = await (await get('/wycena')).text();
  assert.match(html, /id="estimate-disclaimer">Ten pakiet to tylko propozycja, która spełnia wszystkie opisane standardy\. Kompleksową ofertę z wyceną prześlemy e-mailem lub przekażemy telefonicznie\./);
});
