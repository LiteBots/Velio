import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { ROOT, config, googleEnabled, pinConfigured, railwayUrl, preferredSiteUrl } from './config.js';
import { connectDb, closeDb, usingMemory } from './db/index.js';
import { handleApi } from './api/index.js';
import { getSession, isAdminSession } from './lib/auth.js';
import { securityHeaders, redirect } from './lib/http.js';
import { flag, setting, loadSettings } from './lib/settings.js';
import { loadCatalog } from './web/catalog.js';
import {
  render, renderHome, renderServices, renderService, renderPackages, renderPlans, renderAbout, renderContact, renderFaq, renderQuote, renderLegal,
  renderPricing, renderBlog, renderPost, blogRss, renderCases, renderCase, renderReviews, renderLocal, renderArea, renderAdCalculator,
  sitemapXml, robotsTxt, llmsTxt, esc,
} from './web/pages.js';
import { loadContent, seedContent } from './web/content.js';
import { seedIfEmpty } from './db/seed.js';

const PUBLIC = path.join(ROOT, 'public');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};
const COMPRESSIBLE = /^(text\/|application\/(json|xml|manifest)|image\/svg)/;

// ---------- odpowiedzi z kompresją ----------
function sendBody(req, res, status, body, type, cacheControl, extra = {}) {
  const buf = Buffer.isBuffer(body) ? body : Buffer.from(body);
  const headers = { 'Content-Type': type, 'Cache-Control': cacheControl, Vary: 'Accept-Encoding', ...extra };
  const ae = String(req.headers['accept-encoding'] || '');
  let out = buf;
  if (COMPRESSIBLE.test(type) && buf.length > 1024) {
    if (/\bbr\b/.test(ae)) {
      out = zlib.brotliCompressSync(buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 } });
      headers['Content-Encoding'] = 'br';
    } else if (/\bgzip\b/.test(ae)) {
      out = zlib.gzipSync(buf, { level: 6 });
      headers['Content-Encoding'] = 'gzip';
    }
  }
  headers['Content-Length'] = out.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
}

const html = (req, res, body, status = 200) =>
  sendBody(req, res, status, body, MIME['.html'], 'no-cache');

// ---------- pliki statyczne ----------
const staticCache = new Map(); // ścieżka -> { mtime, buf, br, gz, etag }
function serveStatic(req, res, pathname) {
  const rel = path.normalize(decodeURIComponent(pathname)).replace(/^([/\\])+/, '');
  const file = path.join(PUBLIC, rel);
  if (!file.startsWith(PUBLIC + path.sep)) return false;
  let st;
  try { st = fs.statSync(file); } catch { return false; }
  if (!st.isFile()) return false;

  const type = MIME[path.extname(file).toLowerCase()] || 'application/octet-stream';
  const etag = `W/"${st.size.toString(16)}-${Math.floor(st.mtimeMs).toString(16)}"`;
  if (req.headers['if-none-match'] === etag) { res.writeHead(304, { ETag: etag }); res.end(); return true; }

  // Pliki wersjonowane (?v=) można cache'ować długo
  const versioned = /[?&]v=/.test(req.url);
  const cacheControl = versioned ? 'public, max-age=31536000, immutable' : 'public, max-age=3600, must-revalidate';

  let entry = staticCache.get(file);
  if (!entry || entry.mtime !== st.mtimeMs) {
    entry = { mtime: st.mtimeMs, buf: fs.readFileSync(file) };
    if (COMPRESSIBLE.test(type) && entry.buf.length > 1024) {
      entry.br = zlib.brotliCompressSync(entry.buf, { params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 } });
      entry.gz = zlib.gzipSync(entry.buf, { level: 9 });
    }
    staticCache.set(file, entry);
  }
  const ae = String(req.headers['accept-encoding'] || '');
  const headers = { 'Content-Type': type, 'Cache-Control': cacheControl, ETag: etag, Vary: 'Accept-Encoding' };
  let out = entry.buf;
  if (entry.br && /\bbr\b/.test(ae)) { out = entry.br; headers['Content-Encoding'] = 'br'; }
  else if (entry.gz && /\bgzip\b/.test(ae)) { out = entry.gz; headers['Content-Encoding'] = 'gzip'; }
  headers['Content-Length'] = out.length;
  res.writeHead(200, headers);
  res.end(req.method === 'HEAD' ? undefined : out);
  return true;
}

// ---------- strony ----------
const notFound = (req, res) => html(req, res, render('site/404', { path: '', title: 'Nie znaleziono strony — VELIO', robots: 'noindex', bodyClass: 'subpage' }), 404);
// ---------- Domena główna: włączana dopiero, gdy naprawdę prowadzi do tej aplikacji ----------
// Jeśli velioagency.pl nie ma jeszcze DNS (albo nie wskazuje na Railway), strona działa pod adresem Railway
// i nie przekierowuje w próżnię. Sprawdzenie co 5 minut — po podpięciu domeny przełączy się sama.
let domainOk = !config.isProd;
if (config.isProd && railwayUrl) config.siteUrl = railwayUrl; // do czasu pierwszego sprawdzenia
async function checkDomain() {
  if (!config.isProd) return;
  let ok = false;
  try {
    const r = await fetch(`${preferredSiteUrl}/healthz`, { redirect: 'manual', signal: AbortSignal.timeout(6000), headers: { 'X-Velio-Check': '1' } });
    ok = r.status === 200 && (await r.text()).trim() === 'ok';
  } catch { ok = false; }
  if (ok !== domainOk || !checkDomain.logged) {
    console.log(ok ? `  [domena] ${preferredSiteUrl} działa — canonical i przekierowania 301 aktywne.` : `  [domena] ${preferredSiteUrl} jeszcze nie prowadzi do aplikacji (DNS?). Używam ${railwayUrl || 'adresu z żądania'}, przekierowania wyłączone.`);
    checkDomain.logged = true;
  }
  domainOk = ok;
  config.siteUrl = ok || !railwayUrl ? preferredSiteUrl : railwayUrl;
}
const canonicalHost = () => new URL(config.siteUrl).host;

const GOOGLE_ICON = '<svg class="g-ic" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>';
const googleBtn = (label) => (googleEnabled() ? `<a class="button button-google button-block" href="/api/auth/google" data-google>${GOOGLE_ICON} ${label}</a><div class="auth-or"><span>albo e-mailem</span></div>` : '');

const server = http.createServer(async (req, res) => {
  const started = Date.now();
  res.on('finish', () => {
    if (!config.isProd || res.statusCode >= 500) console.log(`${req.method} ${req.url} ${res.statusCode} ${Date.now() - started}ms`);
  });
  securityHeaders(res);

  let url;
  try { url = new URL(req.url, 'http://localhost'); } catch { res.writeHead(400); return res.end(); }
  const p = url.pathname;

  try {
    // 301: adres Railway i druga wersja domeny (www / bez www) → główna domena z SITE_URL
    if (config.canonicalRedirect && domainOk && p !== '/healthz' && (req.method === 'GET' || req.method === 'HEAD')) {
      const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').split(',')[0].trim().toLowerCase();
      if (host && host !== canonicalHost()) return redirect(res, config.siteUrl + req.url, 301);
    }

    if (p.startsWith('/api/')) return await handleApi(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); return res.end(); }

    // Usuwanie końcowego ukośnika i wielkich liter (kanoniczne adresy)
    if (p.length > 1 && p.endsWith('/')) return redirect(res, p.replace(/\/+$/, '') + url.search, 301);
    if (/[A-Z]/.test(p) && !p.startsWith('/assets/') && !/^\/google[\w-]+\.html$/.test(p)) return redirect(res, p.toLowerCase() + url.search, 301);

    // Weryfikacja Google Search Console plikiem HTML (nazwa pliku w ustawieniach lub zmiennej GOOGLE_VERIFICATION_FILE)
    const gfile = String(setting('google_verification_file') || '').trim();
    if (gfile && /^google[\w-]+\.html$/.test(gfile) && p === `/${gfile}`) return sendBody(req, res, 200, `google-site-verification: ${gfile}`, MIME['.html'], 'public, max-age=3600');

    // ---------- Panel zarządzania /admin ----------
    if (p === '/admin/logowanie') {
      const s = await getSession(req);
      if (isAdminSession(s)) return redirect(res, '/admin');
      return html(req, res, render('admin/login', { path: p, title: 'Logowanie — VELIO Admin', robots: 'noindex, nofollow', bodyClass: 'auth-page admin-auth', noTracking: true, raw: { PIN_CONFIGURED: String(pinConfigured()) } }));
    }
    if (p === '/admin' || p.startsWith('/admin/')) {
      const s = await getSession(req);
      if (!isAdminSession(s)) return redirect(res, `/admin/logowanie?next=${encodeURIComponent(p + url.search)}`);
      return html(req, res, render('admin/app', { path: '/admin', title: 'VELIO Admin', robots: 'noindex, nofollow', bodyClass: 'app-page admin-page', noTracking: true }));
    }

    // ---------- Tryb serwisowy (strona publiczna i panel klienta) ----------
    if (flag('maintenance_mode') && !p.startsWith('/assets/') && !['/robots.txt', '/healthz', '/site.webmanifest', '/logowanie'].includes(p)) {
      const s = await getSession(req);
      if (!isAdminSession(s)) {
        res.setHeader('Retry-After', '3600');
        return html(req, res, render('site/maintenance', { path: p, title: 'Prace techniczne — VELIO', robots: 'noindex', raw: { MESSAGE: esc(setting('maintenance_message')) } }), 503);
      }
    }

    switch (p) {
      case '/': return html(req, res, renderHome());
      case '/uslugi': return html(req, res, renderServices());
      case '/pakiety': return html(req, res, renderPackages());
      case '/abonamenty': return html(req, res, renderPlans());
      case '/o-nas': return html(req, res, renderAbout());
      case '/kontakt': return html(req, res, renderContact(url.searchParams.get('temat') || ''));
      case '/faq': return html(req, res, renderFaq());
      case '/wycena': return html(req, res, renderQuote());
      case '/regulamin': return html(req, res, renderLegal('regulamin'));
      case '/polityka-prywatnosci': return html(req, res, renderLegal('prywatnosc'));
      case '/cennik': return html(req, res, renderPricing());
      case '/blog': return html(req, res, renderBlog());
      case '/blog/rss.xml': return sendBody(req, res, 200, blogRss(), 'application/rss+xml; charset=utf-8', 'public, max-age=3600');
      case '/realizacje': return html(req, res, renderCases());
      case '/opinie': return html(req, res, renderReviews());
      case '/obszar-dzialania': return html(req, res, renderArea());
      case '/narzedzia':
      case '/narzedzia/kalkulator-budzetu-reklam':
        if (p === '/narzedzia') return redirect(res, '/narzedzia/kalkulator-budzetu-reklam', 301);
        return html(req, res, renderAdCalculator());
      case '/sitemap.xml': return sendBody(req, res, 200, sitemapXml(), MIME['.xml'], 'public, max-age=3600');
      case '/robots.txt': return sendBody(req, res, 200, robotsTxt(), MIME['.txt'], 'public, max-age=3600');
      case '/llms.txt': return sendBody(req, res, 200, llmsTxt(), MIME['.txt'], 'public, max-age=3600');
      case '/healthz': return sendBody(req, res, 200, 'ok', MIME['.txt'], 'no-store');
      case '/logowanie':
      case '/rejestracja':
      case '/reset-hasla': {
        const s = await getSession(req);
        if (s && p !== '/reset-hasla') return redirect(res, isAdminSession(s) ? '/admin' : '/panel');
        const mode = p === '/logowanie' ? 'login' : p === '/rejestracja' ? 'register' : 'reset';
        const token = String(url.searchParams.get('token') || '').replace(/[^\w-]/g, '').slice(0, 100);
        return html(req, res, render('auth/login', {
          path: p, robots: 'noindex, follow', noTracking: true,
          title: mode === 'login' ? 'Logowanie do panelu klienta — VELIO' : mode === 'register' ? 'Załóż konto w panelu klienta — VELIO' : 'Ustaw nowe hasło — VELIO',
          description: 'Panel klienta VELIO: projekty, zgłoszenia, faktury i dokumenty w jednym miejscu. Logowanie e-mailem lub kontem Google.',
          bodyClass: 'auth-page',
          raw: {
            AUTH_MODE: mode === 'reset' && !token ? 'forgot' : mode,
            ALLOW_REG: String(flag('allow_registration')),
            RESET_TOKEN: token,
            AUTH_ERROR: '',
            GOOGLE_BTN: googleBtn('Kontynuuj z Google'),
            GOOGLE_BTN_REG: googleBtn('Załóż konto przez Google'),
            DEMO_HINT: config.seedDemo
              ? '<button type="button" class="demo-hint" data-demo><span class="demo-ic"><i data-lucide="sparkles"></i></span><span><b>Zobacz panel na danych demo</b><small>demo@velio.pl · Demo1234!</small></span><i data-lucide="arrow-right"></i></button>'
              : '',
          },
        }));
      }
    }

    if (p === '/panel' || p.startsWith('/panel/')) {
      const s = await getSession(req);
      if (!s) return redirect(res, `/logowanie?next=${encodeURIComponent(p + url.search)}`);
      if (isAdminSession(s)) return redirect(res, '/admin');
      return html(req, res, render('client/panel', { path: '/panel', title: 'Panel klienta — VELIO', robots: 'noindex, nofollow', bodyClass: 'app-page', noTracking: true }));
    }

    const dyn = [
      [/^\/uslugi\/([a-z0-9-]+)$/, renderService],
      [/^\/blog\/kategoria\/([a-z0-9-]+)$/, renderBlog],
      [/^\/blog\/([a-z0-9-]+)$/, renderPost],
      [/^\/realizacje\/([a-z0-9-]+)$/, renderCase],
      [/^\/([a-z0-9-]+)$/, renderLocal, true], // strony lokalne, np. /agencja-marketingowa-slupsk
    ];
    for (const [re, fn, fallthrough] of dyn) {
      const m = p.match(re);
      if (!m) continue;
      const out = fn(m[1]);
      if (out) return html(req, res, out);
      if (fallthrough) break; // brak strony lokalnej → dalej (stare adresy, pliki statyczne)
      return notFound(req, res);
    }
    // stare adresy z poprzedniej wersji strony
    const legacy = { '/cookies': '/polityka-prywatnosci', '/branze': '/uslugi', '/ceny': '/cennik', '/cennik-uslug': '/cennik', '/portfolio': '/realizacje', '/wizytowka-google': '/uslugi/wizytowka-google' };
    if (legacy[p]) return redirect(res, legacy[p], 301);

    // favicon.ico → svg
    if (p === '/favicon.ico') return redirect(res, '/assets/img/favicon.svg', 301);

    if (serveStatic(req, res, p)) return;
    return notFound(req, res);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) { res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Błąd serwera'); }
  }
});

server.headersTimeout = 20_000;
server.requestTimeout = 30_000;

// ---------- Start: baza → ustawienia → dane demo → konto admina → serwer ----------
try {
  await connectDb();
} catch (err) {
  console.error('\n  ✖ Nie udało się połączyć z MongoDB:', err.message);
  console.error('    Sprawdź zmienną MONGO_URL (Railway → Variables).\n');
  process.exit(1);
}
await loadSettings();
await loadCatalog();
await seedContent();
await loadContent();
if (config.seedDemo) await seedIfEmpty();

if (!pinConfigured()) console.warn('  ⚠ Brak ADMIN_PIN (4–12 cyfr) — panel /admin jest wyłączony. Ustaw zmienną w Railway → Variables.');
else if (config.admin.pin.length < 6) console.warn('  ⚠ ADMIN_PIN ma mniej niż 6 cyfr — dłuższy kod jest znacznie bezpieczniejszy.');
if (!googleEnabled()) console.log('  [google] Logowanie przez Google wyłączone (brak GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET).');

server.listen(config.port, config.host, () => {
  checkDomain();
  setInterval(checkDomain, 5 * 60 * 1000).unref();
  console.log(`\n  VELIO działa na porcie ${config.port}  →  ${config.siteUrl}`);
  console.log(`  Tryb: ${config.isProd ? 'produkcja' : 'deweloperski'}${config.onRailway ? ' (Railway)' : ''} · baza: ${usingMemory ? 'w pamięci' : 'MongoDB'}`);
  if (config.seedDemo) {
    console.log('  Klient demo:   demo@velio.pl  / Demo1234!   → /panel');
    console.log(`  Administrator: kod ADMIN_PIN${pinConfigured() ? '' : ' (ustaw zmienną!)'}  → /admin\n`);
  }
});

for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { server.close(async () => { await closeDb().catch(() => {}); process.exit(0); }); setTimeout(() => process.exit(0), 5000).unref(); });
