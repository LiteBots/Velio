/* VELIO — logowanie (e-mail, Google), rejestracja i reset hasła */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const V = (document.currentScript?.src.match(/[?&]v=([^&]+)/) || [])[1] || '';
  const icon = (n) => `<svg class="i" aria-hidden="true"><use href="/assets/icons.svg?v=${V}#${n}"></use></svg>`;

  const root = $('.auth-layout');
  const allowReg = root.dataset.allowReg === 'true';
  const forms = { login: $('#form-login'), register: $('#form-register'), forgot: $('#form-forgot'), reset: $('#form-reset') };
  const disabled = $('.auth-disabled');
  const tabsBox = $('.auth-tabs');
  const tabs = $$('[role=tab]');
  const pill = $('.auth-tabs-pill');

  const params = new URLSearchParams(location.search);
  const next = (() => { const n = params.get('next') || ''; return /^\/panel(\/|$|\?)/.test(n) ? n : '/panel'; })();
  const URLS = { login: '/logowanie', register: '/rejestracja', forgot: '/logowanie?haslo=1', reset: location.pathname + location.search };
  const TITLES = { login: 'Logowanie do panelu klienta', register: 'Załóż konto w panelu klienta', forgot: 'Nie pamiętasz hasła?', reset: 'Ustaw nowe hasło' };

  function setMode(mode, push = true) {
    if (mode === 'register' && !allowReg) { /* pokaż komunikat o zamkniętej rejestracji */ }
    const tabMode = mode === 'register' ? 'register' : 'login';
    tabs.forEach((t) => {
      const on = t.dataset.tab === tabMode;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      t.classList.toggle('on', on);
    });
    pill.style.transform = tabMode === 'login' ? 'translateX(0)' : 'translateX(100%)';
    tabsBox.hidden = mode === 'forgot' || mode === 'reset';
    Object.entries(forms).forEach(([k, f]) => { f.hidden = k !== mode || (k === 'register' && !allowReg); });
    disabled.hidden = !(mode === 'register' && !allowReg);
    document.title = `${TITLES[mode]} — VELIO`;
    if (push && mode !== 'reset') history.replaceState(null, '', mode === 'login' || mode === 'register' ? URLS[mode] + (params.get('next') ? `?next=${encodeURIComponent(next)}` : '') : URLS[mode]);
    const first = forms[mode]?.querySelector('input:not([type=checkbox])');
    if (push && first && !forms[mode].hidden) setTimeout(() => first.focus(), 30);
  }
  $$('[data-tab]').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.tab)));
  if (!allowReg) $$('[data-reg-only]').forEach((e) => { e.hidden = true; });
  setMode(params.get('haslo') ? 'forgot' : root.dataset.mode, false);

  function showError(form, msg, info = false) {
    const box = $('.auth-error', form);
    box.hidden = !msg;
    box.classList.toggle('info', info);
    box.innerHTML = msg ? `${icon(info ? 'info' : 'circle-alert')}<span></span>` : '';
    if (msg) box.querySelector('span').textContent = msg;
  }

  // Komunikaty po przekierowaniu (Google, wylogowanie)
  const ERRORS = {
    google_wylaczone: 'Logowanie przez Google nie jest jeszcze skonfigurowane. Zaloguj się e-mailem i hasłem.',
    google_anulowano: 'Logowanie przez Google zostało anulowane.',
    google_sesja: 'Sesja logowania wygasła. Spróbuj ponownie.',
    google_blad: 'Nie udało się połączyć z Google. Spróbuj ponownie za chwilę.',
    google_email: 'Konto Google nie ma potwierdzonego adresu e-mail.',
    google_admin: 'To konto ma dostęp tylko do panelu admina (kod PIN).',
    zablokowane: 'Konto jest zablokowane. Skontaktuj się z VELIO.',
    rejestracja_zamknieta: 'Rejestracja nowych kont jest wyłączona. Konto zakłada zespół VELIO.',
  };
  const err = params.get('blad') || root.dataset.error;
  if (err && ERRORS[err]) showError(forms.login, ERRORS[err]);
  else if (params.get('wylogowano')) showError(forms.login, 'Wylogowano pomyślnie.', true);
  else if (params.get('next')) showError(forms.login, 'Zaloguj się, aby przejść do panelu.', true);

  // Google: przekazujemy docelowy adres
  $$('[data-google]').forEach((a) => { a.href = `/api/auth/google?next=${encodeURIComponent(next)}`; });

  // Pokaż / ukryj hasło
  $$('.pw-toggle').forEach((b) => b.addEventListener('click', () => {
    const input = b.previousElementSibling;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    b.innerHTML = icon(show ? 'eye-off' : 'eye');
    b.setAttribute('aria-label', show ? 'Ukryj hasło' : 'Pokaż hasło');
  }));

  // Siła hasła
  $$('input[autocomplete="new-password"]').forEach((pw) => {
    const meter = $$('.pw-meter i', pw.closest('.field'));
    pw.addEventListener('input', () => {
      const v = pw.value;
      let s = 0;
      if (v.length >= 8) s++;
      if (/[a-ząćęłńóśźż]/i.test(v) && /\d/.test(v)) s++;
      if (/[A-ZĄĆĘŁŃÓŚŹŻ]/.test(v) && /[a-ząćęłńóśźż]/.test(v)) s++;
      if (v.length >= 12 || /[^\w\s]/.test(v)) s++;
      if (!v) s = 0;
      meter.forEach((m, i) => { m.className = i < s ? `on s${s}` : ''; });
    });
  });

  async function post(url, body) {
    const res = await fetch(url, { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) { const e = new Error(data.error || 'Coś poszło nie tak.'); e.fields = data.fields; throw e; }
    return data;
  }

  async function submit(form, url, body, onOk = () => location.assign(next)) {
    showError(form, '');
    $$('.field', form).forEach((f) => f.classList.remove('has-error'));
    const btn = $('button[type=submit]', form);
    const html = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = `${icon('loader-circle')} Chwileczkę…`;
    try {
      const data = await post(url, body);
      btn.innerHTML = `${icon('circle-check')} Gotowe`;
      onOk(data, () => { btn.disabled = false; btn.innerHTML = html; });
    } catch (e) {
      showError(form, e.message === 'Failed to fetch' ? 'Brak połączenia z serwerem.' : e.message);
      Object.keys(e.fields || {}).forEach((k) => form.elements[k]?.closest('.field')?.classList.add('has-error'));
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      btn.disabled = false; btn.innerHTML = html;
    }
  }

  forms.login.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = forms.login.elements;
    if (!f.email.value.trim() || !f.password.value) return showError(forms.login, 'Podaj e-mail i hasło.');
    submit(forms.login, '/api/auth/login', { email: f.email.value.trim(), password: f.password.value, remember: f.remember.checked });
  });

  forms.register.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = forms.register.elements;
    if (!f.consent.checked) return showError(forms.register, 'Zaakceptuj regulamin i politykę prywatności.');
    submit(forms.register, '/api/auth/register', { name: f.name.value, company: f.company.value, email: f.email.value.trim(), password: f.password.value, consent: true });
  });

  forms.forgot.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = forms.forgot.elements;
    const ok = $('.auth-ok', forms.forgot);
    ok.hidden = true;
    if (!f.email.value.trim()) return showError(forms.forgot, 'Podaj adres e-mail.');
    submit(forms.forgot, '/api/auth/forgot', { email: f.email.value.trim() }, (_d, restore) => {
      restore();
      ok.hidden = false;
      ok.innerHTML = `${icon('mail-check')}<span>Jeśli konto z tym adresem istnieje, wysłaliśmy link do ustawienia hasła. Sprawdź skrzynkę (także spam).</span>`;
    });
  });

  forms.reset.addEventListener('submit', (e) => {
    e.preventDefault();
    const f = forms.reset.elements;
    submit(forms.reset, '/api/auth/reset', { token: forms.reset.dataset.token, password: f.password.value }, () => location.assign('/panel'));
  });

  $('[data-demo]')?.addEventListener('click', () => {
    forms.login.elements.email.value = 'demo@velio.pl';
    forms.login.elements.password.value = 'Demo1234!';
    forms.login.requestSubmit();
  });
})();
