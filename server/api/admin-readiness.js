// Panel admina: lista gotowości strony. Same fakty z ustawień, treści i DNS, bez zgadywania.
import dns from 'node:dns/promises';
import { config, googleEnabled, totpEnabled } from '../config.js';
import { getSettings } from '../lib/settings.js';
import { mailEnabled } from '../lib/mail.js';
import { posts, cases, reviews } from '../web/content.js';
import { route } from './router.js';

const SETTINGS = '/admin/ustawienia';
const DNS_TTL = 10 * 60 * 1000;
let dnsCache = { at: 0, host: '', result: null };

/** Czy adres bez www odpowiada. Bez tego osoba wpisująca domenę bez www trafia na błąd przeglądarki. */
async function apexResolves() {
  const { hostname } = new URL(config.siteUrl);
  if (hostname === 'localhost' || /^[\d.]+$/.test(hostname)) return null;
  const apex = hostname.replace(/^www\./, '');
  if (dnsCache.host === apex && Date.now() - dnsCache.at < DNS_TTL) return dnsCache.result;
  const resolver = new dns.Resolver({ timeout: 2500, tries: 1 });
  let result;
  try { result = (await resolver.resolve4(apex)).length > 0; } catch (e) { result = e.code === 'ETIMEOUT' ? null : false; }
  dnsCache = { at: Date.now(), host: apex, result };
  return result;
}

route('GET', '/api/admin/readiness', async () => {
  const s = getSettings();
  const has = (k) => Boolean(String(s[k] || '').trim());
  const apex = await apexResolves();
  const domain = new URL(config.siteUrl).hostname.replace(/^www\./, '');
  const groups = [
    { name: 'Dane firmy', items: [
      { label: 'Telefon na stronie', ok: has('contact_phone'), important: true, hint: 'Klient musi móc zadzwonić. Numer trafi też do danych strukturalnych.', href: SETTINGS },
      { label: 'E-mail kontaktowy', ok: has('contact_email'), important: true, hint: 'Wymagany także w regulaminie jako dane usługodawcy.', href: SETTINGS },
      { label: 'Pełna nazwa firmy i NIP', ok: has('company_nip') && s.company_legal_name !== 'VELIO' && has('company_legal_name'), important: true, hint: 'Dane usługodawcy w stopce, regulaminie i polityce prywatności.', href: SETTINGS },
      { label: 'Adres lub ukryty adres z miastem', ok: has('address_street') || s.hide_address === '1', hint: 'Musi być taki sam jak w wizytówce Google.', href: SETTINGS },
      { label: 'Godziny pracy', ok: has('opening_hours'), hint: 'Widoczne w stopce i na stronie kontaktu.', href: SETTINGS },
    ] },
    { name: 'Google i pomiar', items: [
      { label: 'Link do wizytówki Google', ok: has('gbp_url'), important: true, hint: 'Powiąże stronę z Profilem Firmy.', href: SETTINGS },
      { label: 'Link „wystaw opinię”', ok: has('gbp_review_url'), hint: 'Trafi na /opinie i do szablonu prośby o opinię.', href: SETTINGS },
      { label: 'Analityka GA4 lub Tag Manager', ok: has('ga4_id') || has('gtm_id'), important: true, hint: 'Bez niej nie sprawdzisz, skąd przychodzą zapytania.', href: SETTINGS },
    ] },
    { name: 'Wiarygodność', items: [
      { label: `Co najmniej 5 opinii (masz ${reviews().length})`, ok: reviews().length >= 5, important: true, hint: 'Dodawaj tylko prawdziwe opinie, najlepiej z linkiem do Google.', href: '/admin/tresci/reviews' },
      { label: `Co najmniej 3 realizacje (masz ${cases().length})`, ok: cases().length >= 3, important: true, hint: 'Publikuj po zgodzie klienta, najlepiej z liczbami.', href: '/admin/tresci/cases' },
      { label: `Co najmniej 6 wpisów na blogu (masz ${posts().length})`, ok: posts().length >= 6, hint: 'Poradniki odpowiadają na pytania klientów przed kontaktem.', href: '/admin/tresci/posts' },
      { label: 'Regulamin i polityka sprawdzone przez prawnika', ok: s.legal_reviewed === '1', important: true, hint: 'Po weryfikacji zaznacz to w Ustawieniach → Platforma.', href: SETTINGS },
    ] },
    { name: 'Technika i bezpieczeństwo', items: [
      ...(apex === null ? [] : [{ label: `Działa adres bez www (${domain})`, ok: apex, important: true, hint: `Ustaw u rejestratora domeny przekierowanie ${domain} na główny adres strony.`, href: SETTINGS }]),
      { label: 'Wysyłka e-maili (Resend)', ok: mailEnabled(), important: true, hint: 'Ustaw RESEND_API_KEY i MAIL_FROM. Bez tego nie działa m.in. reset hasła.', href: SETTINGS },
      { label: 'Powiadomienia o nowych leadach', ok: Boolean(config.mail.leadsTo) || has('lead_webhook_url'), important: true, hint: 'Ustaw LEADS_NOTIFY_EMAIL albo webhook, żeby nie przegapić zapytania.', href: SETTINGS },
      { label: 'Kod ADMIN_PIN ma co najmniej 8 cyfr', ok: config.admin.pin.length >= 8, important: true, hint: 'Dłuższy kod jest znacznie trudniejszy do odgadnięcia.', href: SETTINGS },
      { label: 'Logowanie dwuskładnikowe do panelu', ok: totpEnabled(), hint: 'Wygeneruj sekret: npm run cli -- admin:totp i ustaw ADMIN_TOTP_SECRET.', href: SETTINGS },
      { label: 'Logowanie klientów przez Google', ok: googleEnabled(), hint: 'Opcjonalne. Instrukcja jest w README.', href: SETTINGS },
    ] },
  ];
  const all = groups.flatMap((g) => g.items);
  return { groups, done: all.filter((i) => i.ok).length, total: all.length };
}, { auth: 'admin' });
