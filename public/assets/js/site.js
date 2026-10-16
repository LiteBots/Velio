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
  const header = $('#site-header');
  let lastY = scrollY;
  addEventListener('scroll', () => {
    const y = scrollY;
    header?.classList.toggle('is-scrolled', y > 20);
    header?.classList.toggle('is-hidden', y > 500 && y > lastY + 4 && !$('#main-nav')?.classList.contains('open'));
    if (y < lastY - 4 || y < 500) header?.classList.remove('is-hidden');
    lastY = y;
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

  // Stan zalogowania w nagłówku
  fetch('/api/auth/me', { credentials: 'same-origin' }).then((r) => r.json()).then(({ user, admin }) => {
    if (!user) return;
    const label = admin ? 'Panel admina' : 'Panel klienta';
    $$('[data-auth-link]').forEach((a) => { a.href = admin ? '/admin' : '/panel'; if (!a.querySelector('[data-auth-label]')) a.textContent = label; });
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
  function goToContact(type) {
    const contact = $('#kontakt');
    if (!contact) { location.href = '/#kontakt'; return; }
    if (type && topic) {
      const match = [...topic.options].find((o) => o.textContent === type);
      topic.value = match ? match.textContent : 'Bezpłatna wycena';
    }
    contact.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    setTimeout(() => $('#name')?.focus({ preventScroll: true }), 650);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-contact]');
    if (!btn) return;
    if (!$('#kontakt')) return; // podstrona — link prowadzi do /kontakt
    e.preventDefault();
    goToContact(btn.dataset.contactType || '');
  });

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
    try { payload.utm = sessionStorage.getItem('velio-utm') || ''; } catch { /* brak */ }
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
    const utm = new URLSearchParams(location.search).get('utm_source');
    if (utm) sessionStorage.setItem('velio-utm', utm.slice(0, 80));
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

    // Proponowany pakiet na podstawie celu, usług, zasięgu i budżetu
    function recommend() {
      const goal = $('input[name=goal]:checked').value;
      const svc = new Set(checked('#service-choices').map((x) => x.dataset.slug));
      const area = $('#cfg-area').value;
      const budget = $('input[name=budget]:checked')?.value || 'nie wiem';
      const has = (s) => svc.has(s);
      const ai = has('ai-i-automatyzacje') || has('email-marketing-i-crm') || /Automatyzacja/.test(goal);
      const ads = has('reklamy-platne') || has('pozycjonowanie-seo');
      const brandOnly = svc.size > 0 && [...svc].every((s) => ['branding', 'druk-i-materialy', 'odziez-i-gadzety'].includes(s));
      let slug;
      if (svc.size >= 6 || has('ekspansja-zagraniczna') || has('employer-branding') || /Za granicą/.test(area)) slug = 'custom';
      else if (brandOnly || (/Rozpoznawalna/.test(goal) && !svc.size)) slug = null;
      else if (svc.size >= 4 || (has('strony-internetowe') && ads && ai) || budget === 'powyżej 10 tys. zł') slug = 'growth';
      else if (ai) slug = 'automatyzacja-firmy';
      else if (ads || /Więcej zapytań/.test(goal)) slug = 'pierwsi-klienci';
      else slug = 'start';
      const p = slug ? pkg(slug) : null;
      const score = Math.min(100, 14 + svc.size * 9 + (ai ? 14 : 0) + (ads ? 10 : 0) + (slug === 'custom' ? 40 : slug === 'growth' ? 25 : 0));
      if (!p) return { name: 'Wycena indywidualna', price: 'po krótkim briefie', note: 'Branding, druk i materiały wyceniamy po briefie — cena zależy od zakresu, nakładu i wykończenia.', value: 0, score };
      if (!p.priceFrom) return { name: `Pakiet ${p.name}`, price: 'wycena indywidualna', note: 'Zakres wskazuje na rozwiązanie szyte na miarę: wiele kanałów, rynków lub procesów. Przygotujemy plan rozwoju i harmonogram.', value: 0, score };
      return { name: `Pakiet ${p.name}`, price: `od ${pln(p.priceFrom)}`, note: `${p.unit ? `Cena ${p.unit}. ` : ''}Budżet reklamowy i licencje narzędzi są rozliczane osobno. Dokładny zakres potwierdzimy po rozmowie.`, value: p.priceFrom, score };
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
      $('#estimate-meter').style.width = `${rec.score}%`;
      return asText ? `${rows.map(([k, v]) => `${k}: ${v}`).join('\n')}\nPropozycja: ${rec.name} (${rec.price})` : undefined;
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
      let utm = '';
      try { utm = sessionStorage.getItem('velio-utm') || ''; } catch { /* brak */ }
      try {
        const res = await fetch('/api/contact', {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' },
          body: JSON.stringify({
            name: f.name.value, email: f.email.value.trim(), phone: f.phone.value, company: f.company.value, website: f.website.value,
            topic: 'Bezpłatna wycena', source: 'wycena', consent: true, utm, estimate: rec?.value || 0,
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
