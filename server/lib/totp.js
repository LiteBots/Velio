// Kody jednorazowe TOTP (RFC 6238) dla logowania do panelu admina: Google Authenticator, Authy, 1Password itp.
import crypto from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

function base32Decode(secret) {
  let bits = '';
  for (const ch of String(secret).replace(/=+$/, '').toUpperCase()) {
    const v = ALPHABET.indexOf(ch);
    if (v < 0) throw new Error('Niepoprawny sekret TOTP.');
    bits += v.toString(2).padStart(5, '0');
  }
  const bytes = bits.match(/.{8}/g) || [];
  return Buffer.from(bytes.map((b) => parseInt(b, 2)));
}

export function generateTotpSecret() {
  return [...crypto.randomBytes(20)].map((b) => ALPHABET[b % 32]).join('');
}

export function totpCode(secret, time = Date.now(), { digits = 6, step = 30 } = {}) {
  const counter = Buffer.alloc(8);
  counter.writeBigUInt64BE(BigInt(Math.floor(time / 1000 / step)));
  const hmac = crypto.createHmac('sha1', base32Decode(secret)).update(counter).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  return String((hmac.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits).padStart(digits, '0');
}

/** Akceptuje kod z bieżącego okna oraz po jednym oknie obok (różnica zegarów). */
export function verifyTotp(secret, code) {
  const given = Buffer.from(String(code ?? '').trim());
  if (!/^\d{6}$/.test(given.toString())) return false;
  return [-30_000, 0, 30_000].some((d) => crypto.timingSafeEqual(given, Buffer.from(totpCode(secret, Date.now() + d))));
}
