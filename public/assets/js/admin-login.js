/* VELIO Admin — logowanie kodem PIN (zmienna ADMIN_PIN na Railway) */
(() => {
  'use strict';
  document.documentElement.classList.remove('no-js');
  const V = (document.currentScript?.src.match(/[?&]v=([^&]+)/) || [])[1] || '';
  const icon = (n) => `<svg class="i" aria-hidden="true"><use href="/assets/icons.svg?v=${V}#${n}"></use></svg>`;
  const form = document.getElementById('admin-login-form');
  const err = form.querySelector('.auth-error');
  const pin = form.elements.pin;
  const dots = form.querySelector('.pin-dots');
  const next = (() => { const n = new URLSearchParams(location.search).get('next') || ''; return /^\/admin(\/|$|\?)/.test(n) ? n : '/admin'; })();

  const showErr = (m) => { err.hidden = !m; err.innerHTML = m ? `${icon('circle-alert')}<span></span>` : ''; if (m) err.querySelector('span').textContent = m; };
  if (form.dataset.configured !== 'true') showErr('Panel jest wyłączony: ustaw zmienną ADMIN_PIN (4–12 cyfr) w Railway → Variables i zrestartuj aplikację.');

  const drawDots = () => { const n = Math.max(4, pin.value.length); dots.innerHTML = Array.from({ length: n }, (_, i) => `<i class="${i < pin.value.length ? 'on' : ''}"></i>`).join(''); };
  pin.addEventListener('input', () => { pin.value = pin.value.replace(/\D/g, '').slice(0, 12); drawDots(); });
  drawDots();

  form.querySelector('.pw-toggle').addEventListener('click', (e) => {
    const show = pin.type === 'password';
    pin.type = show ? 'text' : 'password';
    e.currentTarget.innerHTML = icon(show ? 'eye-off' : 'eye');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    showErr('');
    if (!/^\d{4,12}$/.test(pin.value)) { showErr('Kod PIN ma od 4 do 12 cyfr.'); pin.focus(); return; }
    const btn = form.querySelector('button[type=submit]');
    const html = btn.innerHTML;
    btn.disabled = true; btn.innerHTML = `${icon('loader-circle')} Sprawdzanie…`;
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'velio' },
        body: JSON.stringify({ pin: pin.value, remember: form.elements.remember.checked }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Nie udało się zalogować.');
      btn.innerHTML = `${icon('circle-check')} Witaj!`;
      location.assign(next);
    } catch (ex) {
      showErr(ex.message === 'Failed to fetch' ? 'Brak połączenia z serwerem.' : ex.message);
      form.classList.remove('shake'); void form.offsetWidth; form.classList.add('shake');
      pin.value = ''; drawDots(); pin.focus();
      btn.disabled = false; btn.innerHTML = html;
    }
  });
  setTimeout(() => pin.focus(), 50);
})();
