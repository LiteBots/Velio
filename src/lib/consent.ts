/**
 * Zgody na cookies. Zapis w ciasteczku pierwszej strony (180 dni).
 * Skrypty analityczne i marketingowe (etap integracji) mogą się ładować tylko,
 * gdy odpowiednia kategoria ma wartość true — sprawdzaj przez readConsent().
 */
export type Consent = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: 1;
  updatedAt: string;
};

export const CONSENT_COOKIE = "velio_consent";
export const CONSENT_EVENT = "velio:consent";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie
    .split("; ")
    .find((c) => c.startsWith(`${CONSENT_COOKIE}=`))
    ?.slice(CONSENT_COOKIE.length + 1);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as Consent;
    return parsed.version === 1 ? parsed : null;
  } catch {
    return null;
  }
}

export function writeConsent(c: { analytics: boolean; marketing: boolean }) {
  const value: Consent = { necessary: true, analytics: c.analytics, marketing: c.marketing, version: 1, updatedAt: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}
