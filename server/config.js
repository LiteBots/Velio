import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// Na Railway wszystkie ustawienia przychodzą jako zmienne środowiskowe (Variables).
// Plik .env jest opcjonalny i służy tylko do pracy lokalnej (nie trafia na GitHuba).
function loadLocalEnv() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (!m) continue;
    let v = m[2];
    if (/^(['"]).*\1$/.test(v)) v = v.slice(1, -1);
    if (process.env[m[1]] === undefined) process.env[m[1]] = v;
  }
}
loadLocalEnv();

const env = process.env;
const bool = (v, d) => (v === undefined || v === '' ? d : /^(1|true|yes|on)$/i.test(v));
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const onRailway = Boolean(env.RAILWAY_ENVIRONMENT || env.RAILWAY_PROJECT_ID);
const port = Number(env.PORT || 3000);
const isProd = env.NODE_ENV === 'production' || onRailway;
// Główna domena strony (canonical, sitemap, dane strukturalne). Adres *.up.railway.app nigdy nie jest kanoniczny.
const DEFAULT_DOMAIN = 'https://velioagency.pl';
let siteUrl = (env.SITE_URL || env.NEXT_PUBLIC_SITE_URL || '').trim().replace(/\/+$/, '');
if (!siteUrl || (isProd && /\.up\.railway\.app$/i.test(siteUrl))) siteUrl = isProd ? DEFAULT_DOMAIN : `http://localhost:${port}`;
const mongoUrl = env.MONGO_URL || env.MONGODB_URI || env.MONGO_PUBLIC_URL || '';

export const config = {
  port,
  host: env.HOST || '0.0.0.0',
  siteUrl,
  isProd,
  onRailway,
  version: `${pkg.version}-${Date.now().toString(36)}`,
  mongoUrl,
  mongoDbName: env.MONGO_DB_NAME || env.MONGODB_DB || 'velio',
  // Dane demo: domyślnie tylko lokalnie bez bazy. Na Railway włączysz je zmienną SEED_DEMO=true.
  seedDemo: bool(env.SEED_DEMO, !mongoUrl && !isProd),
  trustProxy: bool(env.TRUST_PROXY, onRailway),
  // 301 z adresu Railway i z drugiej wersji domeny (www / bez www) na SITE_URL
  canonicalRedirect: bool(env.CANONICAL_REDIRECT, isProd),
  cookieSecure: bool(env.COOKIE_SECURE, siteUrl.startsWith('https://')),
  allowRegistration: bool(env.ALLOW_REGISTRATION, true),
  leadWebhookUrl: env.LEAD_WEBHOOK_URL || '',
  // Panel admina: logowanie kodem PIN ze zmiennej ADMIN_PIN (Railway → Variables)
  admin: {
    pin: String(env.ADMIN_PIN || '').trim(),
    name: env.ADMIN_NAME || 'Właściciel',
    email: (env.ADMIN_EMAIL || '').trim().toLowerCase(),
  },
  // Logowanie przez Google (Google Cloud Console → OAuth client ID)
  google: {
    clientId: (env.GOOGLE_CLIENT_ID || '').trim(),
    clientSecret: (env.GOOGLE_CLIENT_SECRET || '').trim(),
  },
  // E-maile (reset hasła, powiadomienia o zapytaniach) przez Resend
  mail: {
    resendKey: (env.RESEND_API_KEY || '').trim(),
    from: env.MAIL_FROM || env.LEADS_FROM_EMAIL || '',
    leadsTo: env.LEADS_NOTIFY_EMAIL || '',
  },
  // Dane firmy: puste pole = nie jest wyświetlane (nic nie jest zmyślone). Można je też ustawić w /admin/ustawienia.
  // SEO i pomiar (można też ustawić w /admin → Ustawienia → SEO i wizytówka)
  seo: {
    googleVerification: (env.GOOGLE_SITE_VERIFICATION || '').trim(),
    googleVerificationFile: (env.GOOGLE_VERIFICATION_FILE || '').trim(),
    bingVerification: (env.BING_SITE_VERIFICATION || '').trim(),
    gtmId: (env.GTM_ID || '').trim(),
    ga4Id: (env.GA4_ID || env.GA_MEASUREMENT_ID || '').trim(),
  },
  company: {
    legalName: env.COMPANY_LEGAL_NAME || env.NEXT_PUBLIC_COMPANY_LEGAL_NAME || 'VELIO',
    address: env.COMPANY_ADDRESS || env.NEXT_PUBLIC_COMPANY_ADDRESS || '',
    nip: env.COMPANY_NIP || env.NEXT_PUBLIC_COMPANY_NIP || '',
    bank: env.COMPANY_BANK || '',
    email: env.CONTACT_EMAIL || env.NEXT_PUBLIC_CONTACT_EMAIL || '',
    phone: env.CONTACT_PHONE || env.NEXT_PUBLIC_CONTACT_PHONE || '',
    street: env.COMPANY_STREET || '',
    postal: env.COMPANY_POSTAL_CODE || '',
    city: env.COMPANY_CITY || 'Słupsk',
  },
};

/** Adres Railway (zapasowy, gdy domena główna jeszcze nie działa). */
export const railwayUrl = env.RAILWAY_PUBLIC_DOMAIN ? `https://${env.RAILWAY_PUBLIC_DOMAIN}` : '';
export const preferredSiteUrl = siteUrl;

export const googleEnabled = () => Boolean(config.google.clientId && config.google.clientSecret);
export const pinConfigured = () => /^\d{4,12}$/.test(config.admin.pin);
