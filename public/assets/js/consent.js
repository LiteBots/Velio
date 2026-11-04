/* =========================================================
   VELIO — zgody na cookies (Google Consent Mode v2) + GTM / GA4
   Ładowany tylko, gdy w ustawieniach jest GTM_ID lub GA4_ID.
   Domyślnie wszystko „denied”, po wyborze w banerze → update.
   ========================================================= */
(() => {
  'use strict';
  const me = document.currentScript;
  const GTM = me?.dataset.gtm || '';
  const GA4 = me?.dataset.ga4 || '';
  const KEY = 'velio-consent-v2';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); } // eslint-disable-line prefer-rest-params
  window.gtag = window.gtag || gtag;

  const DENIED = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', functionality_storage: 'granted', security_storage: 'granted' };
  gtag('consent', 'default', { ...DENIED, wait_for_update: 500 });
  gtag('set', 'ads_data_redaction', true);
  gtag('set', 'url_passthrough', true);

  let saved = null;
  try { saved = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch { /* brak dostępu */ }
  const toConsent = (c) => ({
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
  });
  if (saved) gtag('consent', 'update', toConsent(saved));

  // Ładowanie tagów (z trybem zgody tagi same respektują wybór)
  const load = (src) => { const s = document.createElement('script'); s.async = true; s.src = src; document.head.appendChild(s); };
  if (GTM) {
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    load(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM)}`);
  } else if (GA4) {
    gtag('js', new Date());
    gtag('config', GA4);
    load(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA4)}`);
  }

  function save(c) {
    try { localStorage.setItem(KEY, JSON.stringify({ ...c, at: new Date().toISOString() })); } catch { /* brak */ }
    gtag('consent', 'update', toConsent(c));
    window.dataLayer.push({ event: 'consent_update', consent_analytics: c.analytics, consent_marketing: c.marketing });
  }

  function banner(force) {
    if (!force && saved) return;
    document.getElementById('cookie-banner')?.remove();
    const el = document.createElement('div');
    el.id = 'cookie-banner';
    el.className = 'cookie-banner';
    el.setAttribute('role', 'dialog');
    el.setAttribute('aria-label', 'Ustawienia plików cookies');
    el.innerHTML = `
      <div class="cookie-text"><b>Pliki cookies</b><p>Używamy cookies analitycznych i marketingowych, żeby mierzyć skuteczność strony i reklam. Niezbędne cookies działają zawsze. Szczegóły w <a href="/polityka-prywatnosci">polityce prywatności</a>.</p>
        <div class="cookie-opts" hidden>
          <label><input type="checkbox" checked disabled> Niezbędne</label>
          <label><input type="checkbox" data-c="analytics"${saved?.analytics ? ' checked' : ''}> Analityczne (Google Analytics)</label>
          <label><input type="checkbox" data-c="marketing"${saved?.marketing ? ' checked' : ''}> Marketingowe (Google Ads, Meta)</label>
        </div>
      </div>
      <div class="cookie-actions">
        <button type="button" class="button button-light button-small" data-a="settings">Ustawienia</button>
        <button type="button" class="button button-light button-small" data-a="reject">Tylko niezbędne</button>
        <button type="button" class="button button-coral button-small" data-a="accept">Akceptuję wszystkie</button>
      </div>`;
    document.body.appendChild(el);
    const opts = el.querySelector('.cookie-opts');
    el.addEventListener('click', (e) => {
      const a = e.target.closest('[data-a]')?.dataset.a;
      if (!a) return;
      if (a === 'settings') {
        if (opts.hidden) { opts.hidden = false; e.target.textContent = 'Zapisz wybór'; return; }
        const c = { analytics: el.querySelector('[data-c=analytics]').checked, marketing: el.querySelector('[data-c=marketing]').checked };
        saved = c; save(c); el.remove(); return;
      }
      const c = a === 'accept' ? { analytics: true, marketing: true } : { analytics: false, marketing: false };
      saved = c; save(c); el.remove();
    });
  }

  const start = () => {
    banner(false);
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-cookie-settings]')) return;
      e.preventDefault(); banner(true);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
