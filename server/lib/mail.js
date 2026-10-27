// Wysyłka e-maili przez Resend (https://resend.com). Bez RESEND_API_KEY e-maile nie są wysyłane,
// a aplikacja działa dalej (np. link do resetu hasła trafia tylko do logów serwera).
import { config } from '../config.js';

export const mailEnabled = () => Boolean(config.mail.resendKey && config.mail.from);

export async function sendMail({ to, subject, text, html, replyTo }) {
  if (!mailEnabled()) {
    console.log(`[mail] (wysyłka wyłączona — brak RESEND_API_KEY / MAIL_FROM) do: ${to} · ${subject}`);
    return false;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${config.mail.resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: config.mail.from, to: [to], subject, text, html, reply_to: replyTo || undefined }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) { console.warn('[mail] Resend odrzucił wiadomość:', res.status, (await res.text()).slice(0, 300)); return false; }
    return true;
  } catch (e) {
    console.warn('[mail]', e.message);
    return false;
  }
}

const escHtml = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/** Prosty szablon e-maila w barwach VELIO. */
export function mailLayout(title, bodyHtml) {
  return `<!doctype html><html lang="pl"><body style="margin:0;background:#07060b;font-family:Arial,Helvetica,sans-serif;color:#f3f1fa">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#07060b;padding:32px 12px"><tr><td align="center">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#121019;border:1px solid #25222f;border-radius:20px">
<tr><td style="padding:28px 32px 8px;font-size:24px;font-weight:800;letter-spacing:-1px">velio<span style="color:#7357ff">.</span></td></tr>
<tr><td style="padding:8px 32px 32px;font-size:15px;line-height:1.6;color:#d8d5e6"><h1 style="font-size:20px;color:#f3f1fa;margin:0 0 14px">${escHtml(title)}</h1>${bodyHtml}</td></tr>
</table></td></tr></table></body></html>`;
}
export { escHtml };
