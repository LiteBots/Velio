import { config } from '../config.js';
import { HttpError, json, readJson } from '../lib/http.js';
import { getSession, rateLimit, isAdminSession } from '../lib/auth.js';

// auth: false | 'user' | 'staff' | 'admin'
const routes = [];
export function route(method, pattern, handler, { auth = false, bodyLimit } = {}) {
  const keys = [];
  const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => { keys.push(k); return '([^/]+)'; }) + '/?$');
  routes.push({ method, re, keys, handler, auth, bodyLimit });
}

export async function handleApi(req, res, url) {
  try {
    const candidates = routes.filter((r) => r.re.test(url.pathname));
    if (!candidates.length) throw new HttpError(404, 'Nie znaleziono.');
    const r = candidates.find((c) => c.method === req.method);
    if (!r) throw new HttpError(405, 'Metoda niedozwolona.');

    // CSRF: mutacje wymagają nagłówka niestandardowego i zgodnego Origin
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.headers['x-requested-with'] !== 'velio') throw new HttpError(403, 'Brak nagłówka żądania.');
      const origin = req.headers.origin;
      if (origin) {
        let host;
        try { host = new URL(origin).host; } catch { host = ''; }
        if (![req.headers.host, new URL(config.siteUrl).host].includes(host)) throw new HttpError(403, 'Niedozwolone źródło żądania.');
      }
    }

    const m = url.pathname.match(r.re);
    const params = Object.fromEntries(r.keys.map((k, i) => [k, decodeURIComponent(m[i + 1])]));
    const session = await getSession(req);
    const user = session?.user;
    if (r.auth && !session) throw new HttpError(401, 'Sesja wygasła. Zaloguj się ponownie.');
    if ((r.auth === 'staff' || r.auth === 'admin') && !isAdminSession(session)) throw new HttpError(403, 'Brak uprawnień do panelu zarządzania. Zaloguj się kodem PIN.');

    const hasBody = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method) && req.headers['content-length'] !== '0';
    const body = hasBody
      ? await readJson(req, r.bodyLimit).catch((e) => { if (e.status === 415 && req.method === 'DELETE') return {}; throw e; })
      : {};
    const result = await r.handler({ req, res, url, params, body, session, user, query: url.searchParams });
    if (!res.headersSent) json(res, 200, result ?? { ok: true });
  } catch (err) {
    if (res.headersSent) return;
    if (err instanceof HttpError) json(res, err.status, { error: err.message, fields: err.fields });
    else if (err.code === 11000 || /duplicate key|UNIQUE constraint/.test(err.message)) json(res, 409, { error: 'Taki wpis już istnieje (wartość musi być unikalna).' });
    else { console.error('[api]', err); json(res, 500, { error: 'Wystąpił błąd serwera. Spróbuj ponownie za chwilę.' }); }
  }
}

export const idParam = (v) => {
  const n = Number(v);
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(404, 'Nie znaleziono.');
  return n;
};

export function limitOr429(key, limit, windowMs) {
  const wait = rateLimit(key, limit, windowMs);
  if (wait) throw new HttpError(429, `Zbyt wiele prób. Spróbuj ponownie za ${Math.ceil(wait / 60)} min.`);
}

// ---------- Słowniki wspólne ----------
export const STAGES = [
  { key: 'do_zrobienia', label: 'W kolejce' },
  { key: 'analiza', label: 'Brief i strategia' },
  { key: 'projekt', label: 'Projekt' },
  { key: 'wdrozenie', label: 'Realizacja' },
  { key: 'testy', label: 'Akceptacja' },
  { key: 'uruchomiony', label: 'Uruchomione' },
  { key: 'rozwoj', label: 'Optymalizacja' },
];
export const TICKET_CATEGORIES = ['pytanie', 'blad', 'zmiana', 'nowa_funkcja', 'rozliczenia'];
export const TICKET_PRIORITIES = ['niski', 'normalny', 'wysoki', 'krytyczny'];
export const TICKET_STATUSES = ['nowe', 'w_toku', 'oczekuje_na_klienta', 'rozwiazane', 'zamkniete'];
export const LEAD_STATUSES = ['nowy', 'w_kontakcie', 'oferta', 'wygrany', 'przegrany'];
export const SOFTWARE_STATUSES = ['aktywne', 'zawieszone', 'wygasle'];
export const DOC_CATEGORIES = ['umowa', 'specyfikacja', 'protokol', 'instrukcja', 'inne'];
export const ticketNo = (id) => `VEL-${String(1000 + id)}`;
