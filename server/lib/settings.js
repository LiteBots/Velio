import { findAll, col } from '../db/index.js';
import { config } from '../config.js';

// Ustawienia edytowalne z panelu admina (kolekcja `settings`), wartości startowe ze zmiennych środowiskowych
const DEFAULTS = () => ({
  company_name: 'VELIO',
  company_legal_name: config.company.legalName,
  company_address: config.company.address,
  company_nip: config.company.nip,
  company_bank: config.company.bank,
  contact_email: config.company.email,
  contact_phone: config.company.phone,
  allow_registration: config.allowRegistration ? '1' : '0',
  maintenance_mode: '0',
  maintenance_message: 'Trwają prace techniczne. Wrócimy za chwilę.',
  invoice_due_days: '14',
  lead_webhook_url: config.leadWebhookUrl,
  // NAP i SEO lokalne — muszą być identyczne jak w wizytówce Google
  address_street: config.company.street,
  address_postal: config.company.postal,
  address_city: config.company.city,
  hide_address: '0',
  area_served: 'Słupsk, Ustka, Lębork, Bytów, Miastko, Pomorze, zdalnie cała Polska',
  opening_hours: '',
  opening_hours_schema: '',
  geo_lat: '',
  geo_lng: '',
  social_facebook: '',
  social_instagram: '',
  social_linkedin: '',
  gbp_url: '',
  gbp_review_url: '',
  maps_embed_url: '',
  // Weryfikacje i pomiar
  google_site_verification: config.seo.googleVerification,
  google_verification_file: config.seo.googleVerificationFile,
  bing_site_verification: config.seo.bingVerification,
  gtm_id: config.seo.gtmId,
  ga4_id: config.seo.ga4Id,
});

let cache = DEFAULTS();

/** Wczytuje ustawienia z bazy do pamięci (przy starcie i po zmianie). */
export async function loadSettings() {
  const out = DEFAULTS();
  for (const r of await findAll('settings')) if (r.key in out) out[r.key] = r.value;
  cache = out;
  return out;
}

export const getSettings = () => cache;

export async function setSettings(patch) {
  const allowed = Object.keys(DEFAULTS());
  for (const [k, v] of Object.entries(patch || {})) {
    if (!allowed.includes(k)) continue;
    await col('settings').updateOne({ key: k }, { $set: { key: k, value: String(v ?? '') } }, { upsert: true });
  }
  return loadSettings();
}

export const setting = (k) => cache[k];
export const flag = (k) => cache[k] === '1';

export function company() {
  const s = cache;
  const street = s.address_street || '', postal = s.address_postal || '', city = s.address_city || '';
  const structured = [street, [postal, city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  return {
    name: s.company_name, legalName: s.company_legal_name, address: s.company_address || structured, nip: s.company_nip, bank: s.company_bank,
    email: s.contact_email, phone: s.contact_phone,
    street, postal, city, hideAddress: s.hide_address === '1',
    // adres publiczny (stopka, kontakt, schema) — przy ukrytym adresie tylko miasto
    publicAddress: s.hide_address === '1' ? city : (structured || s.company_address),
    areaServed: String(s.area_served || '').split(',').map((x) => x.trim()).filter(Boolean),
    hours: s.opening_hours, hoursSchema: s.opening_hours_schema,
    geo: s.geo_lat && s.geo_lng ? { lat: Number(s.geo_lat), lng: Number(s.geo_lng) } : null,
    social: { facebook: s.social_facebook, instagram: s.social_instagram, linkedin: s.social_linkedin },
    gbpUrl: s.gbp_url, gbpReviewUrl: s.gbp_review_url, mapsEmbed: s.maps_embed_url,
  };
}

export function sameAs() {
  const s = cache;
  return [s.social_facebook, s.social_instagram, s.social_linkedin, s.gbp_url].filter((u) => /^https?:\/\//.test(u || ''));
}

export function tracking() {
  const s = cache;
  return {
    gtm: /^GTM-[A-Z0-9]+$/i.test(s.gtm_id || '') ? s.gtm_id.toUpperCase() : '',
    ga4: /^G-[A-Z0-9]+$/i.test(s.ga4_id || '') ? s.ga4_id.toUpperCase() : '',
  };
}
