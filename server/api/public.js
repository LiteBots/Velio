// Publiczne API: kontakt i wycena, newsletter, logowanie (e-mail, Google), reset hasła, logowanie admina kodem PIN
import crypto from 'node:crypto';
import { insert, findOne, update, removeMany, col, nowIso, usingMemory } from '../db/index.js';
import { HttpError, clientIp, text, email, password, redirect } from '../lib/http.js';
import {
  hashPassword, verifyPassword, getDummyHash, createSession, destroySession, resetRateLimit, publicUser, isAdminSession, pinFingerprint, appendCookie,
} from '../lib/auth.js';
import { flag, setting } from '../lib/settings.js';
import { audit } from '../lib/audit.js';
import { sendMail, mailLayout, escHtml } from '../lib/mail.js';
import { config, googleEnabled, pinConfigured } from '../config.js';
import { contactTopics } from '../web/catalog.js';
import { route, limitOr429 } from './router.js';

const SOURCES = ['kontakt', 'wycena', 'usluga', 'pakiet', 'abonament'];
const sha256 = (s) => crypto.createHash('sha256').update(s).digest('hex');

// Zgodność ze starą konfiguracją Railway (healthcheck /api/health)
route('GET', '/api/health', async () => ({ status: 'ok', database: usingMemory ? 'memory' : 'connected' }));

// ---------- Kontakt i wycena ----------
route('POST', '/api/contact', async ({ req, body }) => {
  const ip = clientIp(req);
  if (body.website) return { ok: true }; // honeypot
  limitOr429(`contact:${ip}`, 5, 10 * 60 * 1000);
  const topics = contactTopics();
  const lead = {
    name: text(body, 'name', { label: 'Imię i nazwisko / firma', min: 2, max: 120, required: true }),
    email: email(body),
    phone: text(body, 'phone', { label: 'Telefon', max: 40 }),
    company: text(body, 'company', { label: 'Firma', max: 160 }),
    topic: topics.includes(body.topic) ? body.topic : 'Inny temat',
    message: text(body, 'message', { label: 'Wiadomość', min: 10, max: 6000, required: true }),
    source: SOURCES.includes(body.source) ? body.source : 'kontakt',
    utm_source: text(body, 'utm', { max: 80 }),
    value: Math.max(0, Math.min(10_000_000, Number(body.estimate) || 0)),
  };
  if (body.consent !== true) throw new HttpError(422, 'Zaznacz zgodę na kontakt w sprawie zapytania.', { consent: 'Wymagane' });
  const saved = await insert('leads', {
    ...lead, status: 'nowy', notes: '', assigned_to: null, user_id: null, ip, created_at: nowIso(), updated_at: nowIso(),
  });
  audit(req, null, 'lead.created', 'lead', saved.id, `${lead.name} <${lead.email}>`);
  notifyLead(saved);
  return { ok: true, number: `VEL-${new Date().getFullYear()}-${String(saved.id).padStart(5, '0')}` };
});

function notifyLead(lead) {
  const msg = `Nowe zapytanie VELIO (${lead.topic})\n${lead.name} <${lead.email}> ${lead.phone}\n\n${lead.message.slice(0, 1500)}`;
  const url = setting('lead_webhook_url');
  if (url) {
    fetch(url, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: msg, content: msg.slice(0, 1990) }), signal: AbortSignal.timeout(5000),
    }).catch((e) => console.warn('[lead-webhook]', e.message));
  }
  if (config.mail.leadsTo) {
    sendMail({
      to: config.mail.leadsTo,
      replyTo: lead.email,
      subject: `Nowe zapytanie: ${lead.topic} — ${lead.name}`,
      text: `${msg}\n\nPanel: ${config.siteUrl}/admin/leady`,
      html: mailLayout(`Nowe zapytanie: ${lead.topic}`, `<p><b>${escHtml(lead.name)}</b> &lt;${escHtml(lead.email)}&gt; ${escHtml(lead.phone)}</p><p style="white-space:pre-wrap">${escHtml(lead.message.slice(0, 3000))}</p><p><a style="color:#a894ff" href="${config.siteUrl}/admin/leady">Otwórz w panelu admina</a></p>`),
    });
  }
}

route('POST', '/api/newsletter', async ({ req, body }) => {
  limitOr429(`nl:${clientIp(req)}`, 5, 10 * 60 * 1000);
  const mail = email(body);
  const existing = await findOne('newsletter', { email: mail });
  if (existing) await update('newsletter', { id: existing.id }, { unsubscribed_at: null });
  else await insert('newsletter', { email: mail, source: String(body.source || 'stopka').slice(0, 40), created_at: nowIso(), unsubscribed_at: null });
  return { ok: true };
});

// ---------- Konta klientów ----------
route('GET', '/api/auth/me', ({ user, session }) => ({
  user: publicUser(user),
  admin: isAdminSession(session),
  impersonating: Boolean(session?.impersonatorId),
  allowRegistration: flag('allow_registration'),
  google: googleEnabled(),
}));

route('POST', '/api/auth/login', async ({ req, res, body }) => {
  const ip = clientIp(req);
  const mail = email(body);
  limitOr429(`login-ip:${ip}`, 20, 15 * 60 * 1000);
  limitOr429(`login-mail:${mail}`, 8, 15 * 60 * 1000);
  const user = await findOne('users', { email: mail });
  const hasPassword = Boolean(user?.password_hash);
  const ok = await verifyPassword(String(body.password ?? ''), hasPassword ? user.password_hash : await getDummyHash());
  if (!user || !hasPassword || !ok || user.role === 'admin') {
    audit(req, user, 'auth.login_failed', 'user', user?.id ?? null, mail);
    if (user && !hasPassword && user.google_id) throw new HttpError(401, 'To konto loguje się przez Google. Użyj przycisku „Kontynuuj z Google” albo ustaw hasło przez „Nie pamiętasz hasła?”.');
    throw new HttpError(401, 'Nieprawidłowy e-mail lub hasło.');
  }
  if (user.status === 'blocked') throw new HttpError(403, 'Konto jest zablokowane. Skontaktuj się z VELIO.');
  resetRateLimit(`login-mail:${mail}`);
  user.last_login_at = nowIso();
  await update('users', { id: user.id }, { last_login_at: user.last_login_at });
  await createSession(req, res, user.id, body.remember !== false);
  audit(req, user, 'auth.login', 'user', user.id);
  return { user: publicUser(user) };
});

route('POST', '/api/auth/register', async ({ req, res, body }) => {
  if (!flag('allow_registration')) throw new HttpError(403, 'Rejestracja jest wyłączona. Konto zakłada zespół VELIO.');
  limitOr429(`register:${clientIp(req)}`, 5, 60 * 60 * 1000);
  const data = {
    name: text(body, 'name', { label: 'Imię i nazwisko', min: 2, max: 120, required: true }),
    company: text(body, 'company', { label: 'Firma', max: 160 }),
    email: email(body),
    password: password(body),
  };
  if (body.consent !== true) throw new HttpError(422, 'Musisz zaakceptować regulamin i politykę prywatności.', { consent: 'Wymagane' });
  if (await findOne('users', { email: data.email })) throw new HttpError(409, 'Konto z tym adresem e-mail już istnieje. Zaloguj się albo zresetuj hasło.', { email: 'Zajęty' });
  const u = await insert('users', newUserDoc({ ...data, password_hash: await hashPassword(data.password), last_login_at: nowIso() }));
  await createSession(req, res, u.id, true);
  audit(req, u, 'user.registered', 'user', u.id);
  return { user: publicUser(u) };
});

/** Wspólny kształt dokumentu użytkownika. */
export function newUserDoc(d) {
  return {
    email: d.email, password_hash: d.password_hash ?? null, name: d.name, company: d.company || '', nip: d.nip || '', phone: d.phone || '',
    role: d.role || 'client', status: d.status || 'active', notes: d.notes || '', created_at: d.created_at || nowIso(), last_login_at: d.last_login_at || null,
    google_id: d.google_id || null, is_owner: Boolean(d.is_owner),
  };
}

route('POST', '/api/auth/logout', async ({ req, res, user }) => {
  await destroySession(req, res);
  if (user) audit(req, user, 'auth.logout', 'user', user.id);
  return { ok: true };
});

// Powrót z trybu „zaloguj jako klient” do panelu admina
route('POST', '/api/auth/stop-impersonation', async ({ req, res, session }) => {
  if (!session?.impersonatorId) throw new HttpError(400, 'Nie jesteś w trybie podglądu klienta.');
  const admin = await findOne('users', { id: session.impersonatorId });
  await destroySession(req, res);
  if (!admin || admin.role !== 'admin') throw new HttpError(403, 'Konto administratora jest niedostępne.');
  await createSession(req, res, admin.id, false, null, 'pin');
  audit(req, admin, 'user.impersonation_end', 'user', session.user.id);
  return { ok: true, redirect: `/admin/uzytkownicy/${session.user.id}` };
}, { auth: 'user' });

// ---------- Logowanie przez Google (OAuth 2.0 / OpenID Connect) ----------
const OAUTH_COOKIE = 'velio_oauth';
const googleRedirectUri = () => `${config.siteUrl}/api/auth/google/callback`;
const safeNext = (n) => (/^\/panel(\/|$|\?)/.test(String(n || '')) ? String(n) : '/panel');

route('GET', '/api/auth/google', async ({ req, res, query }) => {
  if (!googleEnabled()) return redirect(res, '/logowanie?blad=google_wylaczone');
  limitOr429(`google:${clientIp(req)}`, 30, 15 * 60 * 1000);
  const state = crypto.randomBytes(24).toString('base64url');
  const next = safeNext(query.get('next'));
  const secure = config.cookieSecure ? '; Secure' : '';
  res.setHeader('Set-Cookie', `${OAUTH_COOKIE}=${state}.${encodeURIComponent(next)}; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=600${secure}`);
  const params = new URLSearchParams({
    client_id: config.google.clientId,
    redirect_uri: googleRedirectUri(),
    response_type: 'code',
    scope: 'openid email profile',
    state,
    prompt: 'select_account',
  });
  return redirect(res, `https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

route('GET', '/api/auth/google/callback', async ({ req, res, query }) => {
  const fail = (code) => {
    appendCookie(res, `${OAUTH_COOKIE}=; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=0`);
    return redirect(res, `/logowanie?blad=${code}`);
  };
  if (!googleEnabled()) return fail('google_wylaczone');
  if (query.get('error')) return fail('google_anulowano');
  const raw = (req.headers.cookie || '').split(';').map((c) => c.trim()).find((c) => c.startsWith(`${OAUTH_COOKIE}=`));
  const [state, nextEnc] = (raw ? raw.slice(OAUTH_COOKIE.length + 1) : '').split('.');
  const given = String(query.get('state') || '');
  if (!state || !given || state.length !== given.length || !crypto.timingSafeEqual(Buffer.from(state), Buffer.from(given))) return fail('google_sesja');

  let profile;
  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: String(query.get('code') || ''), client_id: config.google.clientId, client_secret: config.google.clientSecret,
        redirect_uri: googleRedirectUri(), grant_type: 'authorization_code',
      }),
      signal: AbortSignal.timeout(8000),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok || !tokens.access_token) throw new Error(tokens.error_description || tokens.error || 'brak tokenu');
    const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` }, signal: AbortSignal.timeout(8000),
    });
    profile = await infoRes.json();
    if (!infoRes.ok || !profile.sub) throw new Error('brak profilu');
  } catch (e) {
    console.warn('[google]', e.message);
    return fail('google_blad');
  }
  if (!profile.email || profile.email_verified === false) return fail('google_email');

  const mail = String(profile.email).toLowerCase();
  let user = await findOne('users', { google_id: profile.sub }) || await findOne('users', { email: mail });
  if (user?.role === 'admin') return fail('google_admin');
  if (user && user.status === 'blocked') return fail('zablokowane');
  if (user && !user.google_id) await update('users', { id: user.id }, { google_id: profile.sub });
  if (!user) {
    if (!flag('allow_registration')) return fail('rejestracja_zamknieta');
    user = await insert('users', newUserDoc({
      email: mail, password_hash: null, google_id: profile.sub,
      name: String(profile.name || mail.split('@')[0]).slice(0, 120), last_login_at: nowIso(),
    }));
    audit(req, user, 'user.registered', 'user', user.id, 'Google');
  }
  await update('users', { id: user.id }, { last_login_at: nowIso() });
  appendCookie(res, `${OAUTH_COOKIE}=; Path=/api/auth/google; HttpOnly; SameSite=Lax; Max-Age=0`);
  await createSession(req, res, user.id, true, null, 'google');
  audit(req, user, 'auth.login', 'user', user.id, 'Google');
  return redirect(res, safeNext(decodeURIComponent(nextEnc || '')));
});

// ---------- Reset hasła ----------
route('POST', '/api/auth/forgot', async ({ req, body }) => {
  const mail = email(body);
  limitOr429(`forgot-ip:${clientIp(req)}`, 5, 15 * 60 * 1000);
  limitOr429(`forgot-mail:${mail}`, 3, 60 * 60 * 1000);
  const user = await findOne('users', { email: mail });
  if (user && user.status !== 'blocked' && user.role !== 'admin') {
    const token = crypto.randomBytes(32).toString('base64url');
    await removeMany('password_resets', { user_id: user.id });
    await col('password_resets').insertOne({ token_hash: sha256(token), user_id: user.id, created_at: nowIso(), expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString() });
    const link = `${config.siteUrl}/reset-hasla?token=${token}`;
    const sent = await sendMail({
      to: user.email,
      subject: 'Ustaw nowe hasło do panelu VELIO',
      text: `Dzień dobry,\n\nkliknij link, aby ustawić nowe hasło (ważny 60 minut):\n${link}\n\nJeśli to nie Ty, zignoruj tę wiadomość.`,
      html: mailLayout('Ustaw nowe hasło', `<p>Kliknij przycisk, aby ustawić nowe hasło do panelu klienta. Link jest ważny 60 minut.</p><p style="margin:24px 0"><a href="${link}" style="background:#7357ff;color:#fff;padding:12px 20px;border-radius:12px;text-decoration:none;font-weight:700">Ustaw nowe hasło</a></p><p style="font-size:13px;color:#8f8aa3">Jeśli to nie Ty prosiłeś o zmianę hasła, zignoruj tę wiadomość.</p>`),
    });
    if (!sent && !config.isProd) console.log(`  [reset hasła] ${user.email}: ${link}`);
    audit(req, user, 'auth.password_reset_requested', 'user', user.id);
  }
  // Ta sama odpowiedź niezależnie od tego, czy konto istnieje
  return { ok: true };
});

route('POST', '/api/auth/reset', async ({ req, res, body }) => {
  limitOr429(`reset:${clientIp(req)}`, 10, 15 * 60 * 1000);
  const token = String(body.token || '');
  if (!token || token.length > 100) throw new HttpError(400, 'Link jest nieprawidłowy.');
  const r = await findOne('password_resets', { token_hash: sha256(token) });
  if (!r || r.expires_at < nowIso()) throw new HttpError(410, 'Link wygasł albo został już użyty. Poproś o nowy.');
  const pw = password(body);
  const user = await findOne('users', { id: r.user_id });
  if (!user || user.status === 'blocked') throw new HttpError(410, 'Konto jest niedostępne.');
  await update('users', { id: user.id }, { password_hash: await hashPassword(pw) });
  await removeMany('password_resets', { user_id: user.id });
  await removeMany('sessions', { user_id: user.id }); // wylogowanie ze wszystkich urządzeń
  await createSession(req, res, user.id, true);
  audit(req, user, 'auth.password_reset', 'user', user.id);
  return { ok: true };
});

// ---------- Panel admina: logowanie kodem ADMIN_PIN ----------
const IP_LIMIT = 5, IP_LOCK_MS = 15 * 60 * 1000;
const GLOBAL_LIMIT = 30, GLOBAL_WINDOW_MS = 60 * 60 * 1000, GLOBAL_LOCK_MS = 30 * 60 * 1000;

// Liczniki prób są w bazie, więc restart serwera ich nie zeruje
async function attempts(key) {
  return (await col('login_attempts').findOne({ key })) || { key, fails: 0, locked_until: '', window_start: nowIso() };
}
const saveAttempts = (a) => col('login_attempts').updateOne({ key: a.key }, { $set: { fails: a.fails, locked_until: a.locked_until, window_start: a.window_start } }, { upsert: true });
const minutesLeft = (iso) => Math.max(1, Math.ceil((Date.parse(iso) - Date.now()) / 60000));

async function ownerAccount() {
  let owner = await findOne('users', { is_owner: true });
  if (!owner) owner = await findOne('users', { role: 'admin' }, { sort: { id: 1 } });
  if (owner) {
    if (owner.name !== config.admin.name && owner.is_owner) await update('users', { id: owner.id }, { name: config.admin.name });
    return owner;
  }
  let mail = config.admin.email || 'wlasciciel@velio.local';
  if (await findOne('users', { email: mail })) mail = `wlasciciel+${crypto.randomBytes(3).toString('hex')}@velio.local`;
  return insert('users', newUserDoc({ email: mail, password_hash: null, name: config.admin.name, company: 'VELIO', role: 'admin', is_owner: true }));
}

route('POST', '/api/admin/login', async ({ req, res, body }) => {
  if (!pinConfigured()) throw new HttpError(503, 'Panel jest wyłączony: ustaw zmienną ADMIN_PIN (4–12 cyfr) w Railway → Variables i zrestartuj aplikację.');
  const ip = clientIp(req);
  const now = new Date().toISOString();

  const global = await attempts('global');
  if (global.locked_until && global.locked_until > now) throw new HttpError(429, `Logowanie zablokowane po wielu błędnych próbach. Spróbuj za ${minutesLeft(global.locked_until)} min.`);
  const ipKey = `ip:${sha256(ip).slice(0, 24)}`;
  const perIp = await attempts(ipKey);
  if (perIp.locked_until && perIp.locked_until > now) throw new HttpError(429, `Zbyt wiele błędnych prób z tego urządzenia. Spróbuj za ${minutesLeft(perIp.locked_until)} min.`);

  const given = String(body.pin ?? '').trim();
  await new Promise((r) => setTimeout(r, 350)); // stałe opóźnienie utrudnia zgadywanie
  const a = Buffer.from(sha256(`pin:${given}`)), b = Buffer.from(sha256(`pin:${config.admin.pin}`));
  if (/^\d{4,12}$/.test(given) && crypto.timingSafeEqual(a, b)) {
    await col('login_attempts').deleteOne({ key: ipKey });
    const owner = await ownerAccount();
    await update('users', { id: owner.id }, { last_login_at: nowIso() });
    await createSession(req, res, owner.id, body.remember === true, null, 'pin');
    audit(req, owner, 'auth.admin_login', 'user', owner.id, 'kod PIN');
    return { ok: true, fp: pinFingerprint().slice(0, 4) };
  }

  perIp.fails += 1;
  if (perIp.fails >= IP_LIMIT) { perIp.locked_until = new Date(Date.now() + IP_LOCK_MS).toISOString(); perIp.fails = 0; }
  await saveAttempts(perIp);
  if (Date.parse(global.window_start) < Date.now() - GLOBAL_WINDOW_MS) { global.window_start = now; global.fails = 0; }
  global.fails += 1;
  if (global.fails >= GLOBAL_LIMIT) {
    global.locked_until = new Date(Date.now() + GLOBAL_LOCK_MS).toISOString(); global.fails = 0; global.window_start = now;
    console.warn('[admin] Globalna blokada logowania po wielu błędnych próbach kodu PIN.');
  }
  await saveAttempts(global);
  audit(req, null, 'auth.admin_login_failed', 'user', null, 'błędny kod PIN');
  const left = perIp.locked_until && perIp.locked_until > now ? 0 : IP_LIMIT - perIp.fails;
  throw new HttpError(401, left > 0 ? `Nieprawidłowy kod. Pozostałe próby: ${left}.` : 'Nieprawidłowy kod. Logowanie z tego urządzenia zablokowane na 15 minut.');
});

