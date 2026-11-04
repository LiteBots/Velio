/* VELIO — skrypty strony publicznej (bez zależności) */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const V = (document.currentScript?.src.match(/[?&]v=([^&]+)/) || [])[1] || '';
  const icon = (name) => `<svg class="i" aria-hidden="true"><use href="/assets/icons.svg?v=${V}#${name}"></use></svg>`;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Toast ----------
  function toast(msg, type = 'ok') {
    const host = $('#toast-host') || document.body.appendChild(Object.assign(document.createElement('div'), { id: 'toast-host', className: 'toast-host' }));
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `${icon(type === 'ok' ? 'circle-check' : 'circle-alert')}<span></span>`;
    el.querySelector('span').textContent = msg;
    host.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 4200);
  }

  // ---------- Nagłówek ----------
  // Nagłówek jest zawsze widoczny (wcześniej chował się przy przewijaniu — na telefonie utrudniało to klikanie menu)
  const header = $('#site-header');
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { header?.classList.toggle('is-scrolled', scrollY > 20); ticking = false; });
  }, { passive: true });

  const menuToggle = $('#menu-toggle');
  const nav = $('#main-nav');
  const setMenu = (open) => {
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    menuToggle.innerHTML = icon(open ? 'x' : 'menu');
    nav.classList.toggle('open', open);
  };
  menuToggle?.addEventListener('click', () => setMenu(menuToggle.getAttribute('aria-expanded') !== 'true'));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav?.classList.contains('open')) setMenu(false); });

  // Wskaźnik aktywnej pozycji menu (desktop)
  const indicator = $('.nav-indicator');
  const moveIndicator = (el) => {
    if (!indicator || innerWidth <= 960) return;
    const r = el.getBoundingClientRect(), pr = nav.getBoundingClientRect();
    indicator.style.width = `${r.width}px`;
    indicator.style.left = `${r.left - pr.left}px`;
    indicator.style.opacity = '1';
  };
  $$('a:not(.nav-mobile-only)', nav).forEach((a) => a.addEventListener('mouseenter', () => moveIndicator(a)));
  nav?.addEventListener('mouseleave', () => { if (indicator) indicator.style.opacity = '0'; });

  // Aktywna podstrona w menu
  $$('a', nav).forEach((a) => { const h = a.getAttribute('href'); if (h && !h.includes('#') && h !== '/' && (location.pathname === h || location.pathname.startsWith(`${h}/`))) a.classList.add('is-current'); });

  // Scrollspy
  const navLinks = location.pathname === '/' ? $$('a[href^="/#"]', nav) : [];
  const sections = navLinks.map((a) => document.getElementById(a.getAttribute('href').slice(2))).filter(Boolean);
  if (sections.length && 'IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-current', a.getAttribute('href') === `/#${en.target.id}`));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => spy.observe(s));
  }

  // Stan zalogowania w nagłówku. Tylko klienci: panel admina jest dostępny wyłącznie pod adresem /admin
  fetch('/api/auth/me', { credentials: 'same-origin' }).then((r) => r.json()).then(({ user, admin }) => {
    if (!user || admin) return;
    const label = 'Panel klienta';
    $$('[data-auth-link]').forEach((a) => { a.href = '/panel'; if (!a.querySelector('[data-auth-label]')) a.textContent = label; });
    $$('[data-auth-label]').forEach((s) => { s.textContent = label; });
  }).catch(() => {});

  // ---------- Animacje wejścia ----------
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    reveals.forEach((el) => io.observe(el));
  } else reveals.forEach((el) => el.classList.add('is-in'));

  // Liczniki
  const fmt = new Intl.NumberFormat('pl-PL');
  const counters = $$('[data-count]');
  const runCounter = (el) => {
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = fmt.format(target); return; }
    const t0 = performance.now(), dur = 1400;
    const step = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      el.textContent = fmt.format(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { runCounter(en.target); co.unobserve(en.target); } }), { threshold: 0.4 });
    counters.forEach((c) => co.observe(c));
  }
  setTimeout(() => document.body.classList.add('is-ready'), 50);

  // Dzisiejsza data w podglądzie
  const todayEl = $('[data-today]');
  if (todayEl) todayEl.textContent = new Intl.DateTimeFormat('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date()).replace(/^\w/, (c) => c.toUpperCase()).replace(',', ' ·');

  // ---------- Zakładki branż (ARIA tabs) ----------
  const tablist = $('#industry-tabs');
  if (tablist) {
    const tabs = $$('[role="tab"]', tablist);
    const activate = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.classList.toggle('is-active', on);
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        if (on) { panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering'); }
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => activate(t));
      t.addEventListener('keydown', (e) => {
        const k = e.key;
        let n = null;
        if (k === 'ArrowDown' || k === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (k === 'ArrowUp' || k === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (k === 'Home') n = tabs[0];
        if (k === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); activate(n, true); }
      });
    });
  }

  // ---------- Moduły w przepływie ----------
  const moduleButtons = $$('.module-button');
  const flowSteps = $$('.flow-step');
  let autoFlow = null;
  const setFlow = (idx) => {
    moduleButtons.forEach((b, i) => { b.classList.toggle('active', i === idx); b.setAttribute('aria-pressed', String(i === idx)); });
    flowSteps.forEach((s, i) => s.classList.toggle('active', i === idx));
  };
  moduleButtons.forEach((b, i) => b.addEventListener('click', () => { clearInterval(autoFlow); setFlow(i); }));
  if (flowSteps.length && !reduced && 'IntersectionObserver' in window) {
    let idx = 0;
    const fo = new IntersectionObserver(([en]) => {
      clearInterval(autoFlow);
      if (en.isIntersecting) autoFlow = setInterval(() => { idx = (idx + 1) % flowSteps.length; setFlow(idx); }, 2600);
    }, { threshold: 0.4 });
    fo.observe($('.process-canvas'));
    moduleButtons.forEach((b) => b.addEventListener('click', () => fo.disconnect(), { once: true }));
  }

  // ---------- Kontakt ----------
  const topic = $('#topic');
  function goToContact(type, msg) {
    const contact = $('#kontakt');
    if (!contact) { location.href = '/#kontakt'; return; }
    if (type && topic) {
      const match = [...topic.options].find((o) => o.textContent === type);
      topic.value = match ? match.textContent : 'Bezpłatna wycena';
    }
    const ta = $('#message');
    if (msg && ta && !ta.value.trim()) ta.value = `${msg}\n\n`;
    contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('#name')?.focus({ preventScroll: true }), 650);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-contact]');
    if (!btn) return;
    if (!$('#kontakt')) { // podstrona — przejście na /kontakt z wybraną pozycją
      if (btn.dataset.contactMsg) { try { sessionStorage.setItem('velio-contact-msg', btn.dataset.contactMsg); } catch { /* brak */ } }
      return;
    }
    e.preventDefault();
    goToContact(btn.dataset.contactType || '', btn.dataset.contactMsg || '');
  });
  // wiadomość przeniesiona z cennika na /kontakt
  try {
    const m = sessionStorage.getItem('velio-contact-msg');
    if (m && $('#message')) { sessionStorage.removeItem('velio-contact-msg'); $('#message').value = `${m}\n\n`; }
  } catch { /* brak */ }

  // ---------- Kalkulator budżetu reklam ----------
  const calc = $('#ad-calc');
  if (calc) {
    const num = (id) => Math.max(0, parseFloat(String($(id).value).replace(',', '.')) || 0);
    const nf0 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });
    const nf1 = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 1 });
    const zl = (v) => `${nf0.format(Math.round(v))} zł`;
    const out = (k, v) => { $(`[data-out="${k}"]`, calc).textContent = v; };
    const run = () => {
      const budget = num('#c-budget'), cpc = num('#c-cpc'), cr = num('#c-cr') / 100, close = num('#c-close') / 100, value = num('#c-value'), fee = num('#c-fee');
      const clicks = cpc > 0 ? budget / cpc : 0;
      const leads = clicks * cr;
      const clients = leads * close;
      out('clicks', nf0.format(clicks));
      out('leads', nf1.format(leads));
      out('clients', nf1.format(clients));
      out('cpl', leads > 0 ? zl(budget / leads) : '—');
      out('cac', clients > 0 ? zl((budget + fee) / clients) : '—');
      const roi = clients * value - budget - fee;
      out('roi', `${roi >= 0 ? '+' : '−'}${zl(Math.abs(roi))}`);
      $('[data-out="roi"]', calc).classList.toggle('neg', roi < 0);
    };
    calc.addEventListener('input', run);
    calc.addEventListener('submit', (e) => e.preventDefault());
    run();
  }

  // ---------- Kalkulator kosztu strony ----------
  const siteCalc = $('#site-calc');
  if (siteCalc) {
    const zl = (v) => `${new Intl.NumberFormat('pl-PL').format(v)} zł`;
    const run = () => {
      const base = Number(siteCalc.elements.kind.value);
      const pages = Math.max(0, parseInt(siteCalc.elements.pages.value, 10) || 0);
      const extras = $$('input[type=checkbox]:checked', siteCalc).reduce((s, c) => s + Number(c.value), 0);
      const from = base + pages * 150 + extras;
      $('[data-out="site-from"]', siteCalc).textContent = zl(from);
      $('[data-out="site-to"]', siteCalc).textContent = zl(Math.round((from * 1.4) / 10) * 10);
      const cta = $('[data-site-cta]', siteCalc);
      if (cta) cta.dataset.contactMsg = `Kalkulator strony: ${siteCalc.elements.kind.selectedOptions[0].text}, dodatkowe podstrony: ${pages}, szacunek od ${zl(from)} netto.`;
    };
    siteCalc.addEventListener('input', run);
    siteCalc.addEventListener('submit', (e) => e.preventDefault());
    run();
  }

  // ---------- Test wizytówki Google ----------
  const gbp = $('#gbp-check');
  if (gbp) {
    const run = () => {
      const all = $$('input[type=checkbox]', gbp);
      const score = all.filter((c) => c.checked).reduce((s, c) => s + Number(c.value), 0);
      const max = all.reduce((s, c) => s + Number(c.value), 0);
      const pct = Math.round((score / max) * 100);
      $('[data-out="gbp-score"]', gbp).textContent = `${pct}%`;
      $('[data-out="gbp-note"]', gbp).textContent = pct >= 80 ? 'Solidna podstawa. Teraz liczą się regularne opinie i posty.' : pct >= 50 ? 'Dobry start, ale klient wciąż może wybrać lepiej uzupełniony profil.' : 'Tu najłatwiej o szybką poprawę. Zacznij od pozycji, których brakuje.';
      const missing = all.filter((c) => !c.checked).map((c) => c.closest('label').querySelector('span').textContent.trim());
      const cta = $('[data-gbp-cta]', gbp);
      if (cta) cta.dataset.contactMsg = `Test wizytówki Google: wynik ${pct}%. Do poprawy: ${missing.slice(0, 6).join('; ') || 'nic'}.`;
    };
    gbp.addEventListener('change', run);
    gbp.addEventListener('submit', (e) => e.preventDefault());
    run();
  }

  const leadOrigin = () => {
    try {
      return {
        utm: sessionStorage.getItem('velio-utm') || '', utmCampaign: sessionStorage.getItem('velio-utm-campaign') || '',
        landing: sessionStorage.getItem('velio-landing') || '', referrer: sessionStorage.getItem('velio-referrer') || '',
      };
    } catch { return {}; }
  };

  const form = $('#contact-form');
  const status = $('#form-status');
  const wrap = $('#contact-wrap');
  const setFieldError = (name, msg) => {
    const f = form.elements[name]?.closest('.field');
    if (f) f.classList.toggle('has-error', !!msg);
    const out = $(`[data-error-for="${name}"]`, form);
    if (out) out.textContent = msg || '';
  };
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    ['name', 'email', 'message'].forEach((n) => setFieldError(n, ''));
    status.className = 'form-status'; status.textContent = '';
    let bad = false;
    if (form.elements.name.value.trim().length < 2) { setFieldError('name', 'Podaj imię i nazwisko lub nazwę firmy.'); bad = true; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.elements.email.value.trim())) { setFieldError('email', 'Podaj poprawny adres e-mail.'); bad = true; }
    if (form.elements.message.value.trim().length < 10) { setFieldError('message', 'Opisz potrzebę w kilku zdaniach (min. 10 znaków).'); bad = true; }
    if (!form.elements.consent.checked) { status.className = 'form-status err'; status.innerHTML = `${icon('circle-alert')} Zaznacz zgodę na kontakt.`; bad = true; }
    if (bad) { form.querySelector('.has-error input, .has-error textarea')?.focus(); return; }

    const btn = form.querySelector('button[type=submit]');
    const original = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = `${icon('loader-circle')} Wysyłanie…`;
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.consent = form.elements.consent.checked;
    Object.assign(payload, leadOrigin());
    try {
      const res = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' }, body: JSON.stringify(payload) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        Object.entries(data.fields || {}).forEach(([k, v]) => setFieldError(k, v));
        throw new Error(data.error || 'Nie udało się wysłać wiadomości.');
      }
      form.reset();
      const nr = $('[data-lead-number]', wrap); if (nr) nr.textContent = data.number || '—';
      wrap.classList.add('is-sent');
      $('.form-success', wrap)?.focus();
    } catch (err) {
      status.className = 'form-status err';
      status.innerHTML = `${icon('circle-alert')} <span></span>`;
      status.querySelector('span').textContent = err.message === 'Failed to fetch' ? 'Brak połączenia. Spróbuj ponownie.' : err.message;
    } finally { btn.disabled = false; btn.innerHTML = original; }
  });
  $('[data-reset-contact]')?.addEventListener('click', () => { wrap.classList.remove('is-sent'); $('#name')?.focus(); });

  // ---------- Newsletter ----------
  const nl = $('#newsletter-form');
  nl?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = $('.newsletter-status', nl);
    const mail = nl.elements.email.value.trim();
    out.className = 'newsletter-status';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail)) { out.classList.add('err'); out.textContent = 'Podaj poprawny adres e-mail.'; return; }
    try {
      const r = await fetch('/api/newsletter', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' }, body: JSON.stringify({ email: mail, source: 'stopka' }) });
      if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || 'Nie udało się zapisać.');
      nl.reset(); out.textContent = 'Dziękujemy! Jesteś na liście.';
    } catch (err) { out.classList.add('err'); out.textContent = err.message; }
  });

  // Źródło kampanii (utm_source) zapamiętane na czas wizyty i dołączane do zapytań
  try {
    const qs = new URLSearchParams(location.search);
    const utm = qs.get('utm_source'), campaign = qs.get('utm_campaign');
    if (utm) sessionStorage.setItem('velio-utm', utm.slice(0, 80));
    if (campaign) sessionStorage.setItem('velio-utm-campaign', campaign.slice(0, 120));
    if (!sessionStorage.getItem('velio-landing')) {
      sessionStorage.setItem('velio-landing', location.pathname.slice(0, 300));
      if (document.referrer && !document.referrer.startsWith(location.origin)) sessionStorage.setItem('velio-referrer', document.referrer.split('?')[0].slice(0, 300));
    }
  } catch { /* brak dostępu */ }


  // ---------- Bezpłatna wycena (konfigurator) ----------
  // Na każdej stronie jako okno (modal), a na /wycena wbudowany w treść (data-inline).
  const modal = $('#config-modal');
  if (modal) {
    const inline = modal.hasAttribute('data-inline');
    const steps = $$('.config-step', modal);
    const progress = $$('.progress-step', modal);
    const nextBtn = $('#config-next'), backBtn = $('#config-back');
    const timeline = $('#timeline'), timelineLabel = $('#timeline-label');
    const timelineMap = { 1: 'Jak najszybciej', 2: 'W ciągu miesiąca', 3: 'W ciągu 2–3 miesięcy', 4: 'Bez presji czasowej' };
    const cfgForm = $('#config-form'), cfgStatus = $('#config-status'), cfgSuccess = $('#config-success');
    let packs = [];
    try { packs = JSON.parse($('.configurator', modal).dataset.packages || '[]'); } catch { /* brak */ }
    let current = 1, lastFocus = null, sent = false, rec = null;
    timeline.addEventListener('input', () => { timelineLabel.textContent = timelineMap[timeline.value]; });

    const open = (preselect) => {
      if (inline) { modal.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' }); return; }
      lastFocus = document.activeElement;
      if (preselect) $$(`#service-choices input[data-slug="${preselect}"]`).forEach((c) => { c.checked = true; });
      modal.hidden = false; modal.classList.add('is-open'); document.body.classList.add('modal-open');
      show(sent ? 5 : 1);
      setTimeout(() => $('input, button', steps[sent ? 4 : 0])?.focus(), 50);
      if (location.hash !== '#wycena') history.replaceState(null, '', '#wycena');
    };
    const close = () => {
      if (inline) return;
      modal.classList.remove('is-open'); modal.hidden = true; document.body.classList.remove('modal-open');
      if (location.hash === '#wycena') history.replaceState(null, '', location.pathname + location.search);
      lastFocus?.focus?.();
    };
    function show(step) {
      current = step;
      steps.forEach((s) => s.classList.toggle('active', Number(s.dataset.step) === step));
      progress.forEach((p) => { const n = Number(p.dataset.progress); p.classList.toggle('active', n === step); p.classList.toggle('done', n < step); });
      $('#config-bar').style.width = `${step * 20}%`;
      $('#config-step-label').textContent = `Krok ${step} z 5 · Bezpłatna wycena`;
      backBtn.style.visibility = step === 1 || sent ? 'hidden' : 'visible';
      nextBtn.hidden = sent;
      nextBtn.innerHTML = step === 5 ? `${icon('send')} Wyślij brief` : `Dalej ${icon('arrow-right')}`;
      if (step === 5) buildSummary();
      if (!inline) $('.config-main', modal).scrollTop = 0; // nowy krok zawsze od góry
    }
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-open-config]');
      if (!b) return;
      e.preventDefault(); open(b.dataset.service);
    });
    $('[data-close-config]', modal)?.addEventListener('click', close);
    if (!inline) modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (inline || !modal.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') { // pułapka fokusu
        const f = $$('button, input, select, textarea, a[href]', modal).filter((x) => x.offsetParent !== null && !x.disabled);
        if (!f.length) return;
        if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
      }
    });
    nextBtn.addEventListener('click', () => {
      if (current < 5) { show(current + 1); if (inline) modal.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' }); return; }
      cfgForm.requestSubmit();
    });
    backBtn.addEventListener('click', () => { if (current > 1) show(current - 1); });
    if (location.hash === '#wycena' || location.hash === '#konfigurator') open();
    if (inline) show(1);

    const checked = (sel) => $$(`${sel} input:checked`);
    const pkg = (slug) => packs.find((p) => p.slug === slug);
    const pln = (v) => `${new Intl.NumberFormat('pl-PL').format(v)} zł`;

    // Podpowiedź, nie narzucanie: najpierw najtańszy sensowny start, a pakiet tylko jako opcja mieszcząca się w budżecie
    const BUDGET_CAP = { 'do 1 000 zł': 1000, '1–3 tys. zł': 3000, '3–5 tys. zł': 5000, '5–10 tys. zł': 10000, 'powyżej 10 tys. zł': Infinity, 'nie wiem': 3000 };

    function suggestPackage(svc) {
      const goal = $('input[name=goal]:checked').value;
      const area = $('#cfg-area').value;
      const budget = $('input[name=budget]:checked')?.value || 'nie wiem';
      const industry = $('#cfg-industry').value.toLowerCase();
      const has = (s) => svc.has(s);
      const ai = has('ai-i-automatyzacje') || has('email-marketing-i-crm') || /Automatyzacja/.test(goal);
      const ads = has('reklamy-platne') || has('pozycjonowanie-seo');
      const brandOnly = svc.size > 0 && [...svc].every((s) => ['branding', 'druk-i-materialy', 'odziez-i-gadzety'].includes(s));
      const cap = BUDGET_CAP[budget] ?? 3000;
      const local = /Lokalnie/.test(area);
      if (svc.size === 1 || brandOnly) return null; // jedna usługa albo sam branding: bez pakietu
      if (svc.size >= 6 || has('ekspansja-zagraniczna') || has('employer-branding') || /Za granicą/.test(area)) return pkg('custom') || null;
      const specific = [];
      if (/nocleg|pensjonat|apartament|agrotury|hotel|kwater|domki|turyst/.test(industry)) specific.push('sezon');
      if (/sklep|e-?commerce|sprzeda[żz] online/.test(industry)) specific.push('sklep-start');
      if (ai && /transport|przeprowadz|serwis|flot|ekip/.test(industry)) specific.push('panel-firmy');
      if (svc.size >= 4 && cap >= 5000) specific.push('growth');
      const general = [];
      if (ai) general.push('automatyzacja-firmy');
      if (ads || /Więcej zapytań/.test(goal)) general.push('pierwsi-klienci');
      if (local) general.push('lokalny-start');
      general.push('start', 'lokalny-start');
      const fits = (list) => list.map(pkg).filter((p) => p?.priceFrom && p.priceFrom <= cap);
      const options = fits(general);
      if (budget === 'nie wiem') options.sort((a, b) => a.priceFrom - b.priceFrom); // bez budżetu: najmniejszy pasujący pakiet
      return fits(specific)[0] || options[0] || null;
    }

    function recommend() {
      const picked = checked('#service-choices');
      const svc = new Set(picked.map((x) => x.dataset.slug));
      const priced = picked.filter((x) => Number(x.dataset.min) > 0);
      const allPriced = priced.length === picked.length;
      const sum = priced.reduce((a, x) => a + Number(x.dataset.min), 0);
      const cheapest = [...priced].sort((a, b) => Number(a.dataset.min) - Number(b.dataset.min))[0];
      const p = suggestPackage(svc);
      const pack = p ? (p.priceFrom ? `Pakiet ${p.name}, od ${pln(p.priceFrom)} ${p.unit || 'netto'}` : `Pakiet ${p.name}, wycena indywidualna`) : '';
      const optional = pack ? `Nie musisz wybierać pakietu. Jeśli wystarczy mniejszy zakres, wycenimy tylko to, czego potrzebujesz.` : '';
      if (cheapest) {
        const many = picked.length > 1;
        const total = many ? (allPriced ? `Wszystkie wybrane usługi osobno: od ${pln(sum)} netto. ` : `Część wybranych usług wycenimy po krótkim briefie. `) : '';
        return { price: `od ${pln(Number(cheapest.dataset.min))}`, name: `${many ? 'Najtańsza z wybranych usług: ' : ''}${cheapest.value}`, note: `${total}Bez minimum zamówienia. Dokładną kwotę potwierdzimy po krótkiej rozmowie. ${optional}`.trim(), pack, value: allPriced ? sum : 0 };
      }
      if (picked.length) return { price: 'wycena po briefie', name: picked.map((x) => x.value).join(', '), note: `Bez minimum zamówienia. Cena zależy od zakresu. ${optional}`.trim(), pack, value: 0 };
      return { price: 'Od jednej usługi', name: 'Doradzimy, od czego zacząć', note: `Bez minimum zamówienia. Zakres i cenę ustalimy po krótkiej rozmowie. ${optional}`.trim(), pack, value: 0 };
    }

    function buildSummary(asText = false) {
      const services = checked('#service-choices').map((x) => x.value);
      rec = recommend();
      const rows = [
        ['Cel', $('input[name=goal]:checked').value],
        ['Branża', $('#cfg-industry').value.trim() || 'nie podano'],
        ['Etap firmy', $('#cfg-stage').value],
        ['Klienci', $('#cfg-area').value],
        ['Strona', $('#cfg-site').value],
        ['Usługi', services.length ? services.join(', ') : 'do doradzenia'],
        ['Budżet na start', $('input[name=budget]:checked')?.value || 'nie wiem'],
        ['Start', timelineMap[timeline.value]],
      ];
      const list = $('#config-summary');
      list.textContent = '';
      rows.forEach(([k, v]) => {
        const row = document.createElement('div'); row.className = 'summary-row';
        const a = document.createElement('span'); a.textContent = k;
        const b = document.createElement('b'); b.textContent = v;
        row.append(a, b); list.append(row);
      });
      $('#estimate-price').textContent = rec.price;
      $('#estimate-name').textContent = rec.name;
      $('#estimate-note').textContent = rec.note;
      $('#estimate-package').hidden = !rec.pack;
      $('#estimate-package-name').textContent = rec.pack ? `Może pasować też: ${rec.pack}` : '';
      return asText ? `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\nStart: ${rec.price} (${rec.name})${rec.pack ? `\nMożliwy pakiet: ${rec.pack}` : ''}` : undefined;
    }

    cfgForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = cfgForm.elements;
      cfgStatus.className = 'form-status'; cfgStatus.textContent = '';
      $$('.field', cfgForm).forEach((x) => x.classList.remove('has-error'));
      const fail = (msg, field) => {
        if (field) f[field]?.closest('.field')?.classList.add('has-error');
        cfgStatus.className = 'form-status err';
        cfgStatus.innerHTML = `${icon('circle-alert')} <span></span>`;
        cfgStatus.querySelector('span').textContent = msg;
        (field ? f[field] : f.consent)?.focus();
      };
      if (f.name.value.trim().length < 2) return fail('Podaj imię i nazwisko.', 'name');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim())) return fail('Podaj poprawny adres e-mail.', 'email');
      if (!f.consent.checked) return fail('Zaznacz zgodę na kontakt w sprawie wyceny.');
      const brief = buildSummary(true);
      const html = nextBtn.innerHTML;
      nextBtn.disabled = true; nextBtn.innerHTML = `${icon('loader-circle')} Wysyłanie…`;
      try {
        const res = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' },
          body: JSON.stringify({
            name: f.name.value, email: f.email.value.trim(), phone: f.phone.value, company: f.company.value, website: f.website.value,
            topic: 'Bezpłatna wycena', source: 'wycena', consent: true, ...leadOrigin(), estimate: rec?.value || 0,
            message: `Brief z formularza wyceny:\n\n${brief}${f.notes.value.trim() ? `\n\nDodatkowe informacje:\n${f.notes.value.trim()}` : ''}`,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data.error || 'Nie udało się wysłać briefu.');
        sent = true;
        $('#config-number').textContent = data.number || '—';
        cfgForm.hidden = true;
        $('.summary-grid', modal).hidden = true;
        cfgSuccess.hidden = false;
        show(5);
        cfgSuccess.focus();
        toast('Dziękujemy! Brief został wysłany.');
      } catch (err) {
        fail(err.message === 'Failed to fetch' ? 'Brak połączenia. Spróbuj ponownie.' : err.message);
      } finally { nextBtn.disabled = false; if (!sent) nextBtn.innerHTML = html; }
    });
  }
})();
