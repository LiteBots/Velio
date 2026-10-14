import "server-only";
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Logowanie do panelu właściciela kodem PIN z zmiennej ADMIN_PIN (Railway → Variables).
 *
 * Bezpieczeństwo przy krótkim, 4-cyfrowym kodzie:
 *  - po 5 błędnych próbach z jednego adresu IP — blokada na 15 minut,
 *  - po 20 błędnych próbach łącznie w ciągu godziny — blokada logowania dla wszystkich na godzinę
 *    (chroni przed zgadywaniem z wielu adresów),
 *  - sesja w ciasteczku httpOnly podpisanym HMAC (ADMIN_SESSION_SECRET), ważna 12 godzin,
 *  - zmiana ADMIN_PIN unieważnia wszystkie otwarte sesje.
 */

export const ADMIN_COOKIE = "velio_admin";
const SESSION_HOURS = 12;
const IP_LIMIT = 5;
const IP_LOCK_MS = 15 * 60 * 1000;
const GLOBAL_LIMIT = 20;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;

const g = globalThis as unknown as {
  __velioAdmin?: {
    secret: string;
    perIp: Map<string, { fails: number; lockedUntil: number; first: number }>;
    global: number[];
    globalLockedUntil: number;
  };
};

function state() {
  if (!g.__velioAdmin) {
    const envSecret = process.env.ADMIN_SESSION_SECRET;
    if (!envSecret) {
      console.warn("[admin] Brak ADMIN_SESSION_SECRET — używam losowego klucza; sesje wygasną po restarcie serwera.");
    }
    g.__velioAdmin = {
      secret: envSecret && envSecret.length >= 16 ? envSecret : randomBytes(32).toString("hex"),
      perIp: new Map(),
      global: [],
      globalLockedUntil: 0,
    };
  }
  return g.__velioAdmin;
}

export function isAdminConfigured() {
  const pin = process.env.ADMIN_PIN?.trim();
  return Boolean(pin && /^\d{4,12}$/.test(pin));
}

function pinFingerprint() {
  return createHash("sha256").update(`velio-pin:${process.env.ADMIN_PIN ?? ""}`).digest("hex").slice(0, 16);
}

function sign(payload: string) {
  return createHmac("sha256", state().secret).update(`${payload}:${pinFingerprint()}`).digest("base64url");
}

function safeEqual(a: string, b: string) {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) {
    // porównanie o stałym czasie także przy różnej długości
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
}

export function ipHash(ip: string) {
  return createHash("sha256").update(`admin:${ip}`).digest("hex").slice(0, 24);
}

export type LoginResult = { ok: true } | { ok: false; error: string };

export async function attemptLogin(pin: string): Promise<LoginResult> {
  if (!isAdminConfigured()) {
    return { ok: false, error: "Panel jest wyłączony: ustaw zmienną ADMIN_PIN (4–12 cyfr) w Railway → Variables." };
  }
  const s = state();
  const now = Date.now();
  const ip = await clientIp();

  if (s.globalLockedUntil > now) {
    const min = Math.ceil((s.globalLockedUntil - now) / 60000);
    return { ok: false, error: `Logowanie zablokowane po wielu błędnych próbach. Spróbuj za ${min} min.` };
  }
  const rec = s.perIp.get(ip) ?? { fails: 0, lockedUntil: 0, first: now };
  if (rec.lockedUntil > now) {
    const min = Math.ceil((rec.lockedUntil - now) / 60000);
    return { ok: false, error: `Zbyt wiele błędnych prób z tego urządzenia. Spróbuj za ${min} min.` };
  }

  const expected = process.env.ADMIN_PIN!.trim();
  const given = String(pin ?? "").trim();
  // stałe opóźnienie utrudnia szybkie zgadywanie
  await new Promise((r) => setTimeout(r, 400));

  if (/^\d{4,12}$/.test(given) && safeEqual(given, expected)) {
    s.perIp.delete(ip);
    const exp = now + SESSION_HOURS * 3600 * 1000;
    const payload = String(exp);
    const jar = await cookies();
    jar.set(ADMIN_COOKIE, `${payload}.${sign(payload)}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: SESSION_HOURS * 3600,
    });
    await logAdmin("logowanie", undefined, "Udane logowanie", ip);
    return { ok: true };
  }

  rec.fails += 1;
  if (rec.fails >= IP_LIMIT) {
    rec.lockedUntil = now + IP_LOCK_MS;
    rec.fails = 0;
  }
  s.perIp.set(ip, rec);
  s.global = s.global.filter((t) => now - t < GLOBAL_WINDOW_MS);
  s.global.push(now);
  if (s.global.length >= GLOBAL_LIMIT) {
    s.globalLockedUntil = now + GLOBAL_WINDOW_MS;
    s.global = [];
    console.warn("[admin] Globalna blokada logowania po wielu błędnych próbach.");
  }
  await logAdmin("logowanie_nieudane", undefined, "Błędny kod PIN", ip);

  const left = rec.lockedUntil > now ? 0 : IP_LIMIT - rec.fails;
  return {
    ok: false,
    error: left > 0 ? `Nieprawidłowy kod. Pozostałe próby: ${left}.` : "Nieprawidłowy kod. Logowanie zablokowane na 15 minut.",
  };
}

export async function isAdmin() {
  if (!isAdminConfigured()) return false;
  const jar = await cookies();
  const raw = jar.get(ADMIN_COOKIE)?.value;
  if (!raw) return false;
  const [payload, sig] = raw.split(".");
  if (!payload || !sig) return false;
  if (!safeEqual(sig, sign(payload))) return false;
  return Number(payload) > Date.now();
}

/** Wywoływane na początku każdej strony i akcji panelu. Weryfikacja zawsze po stronie serwera. */
export async function requireAdmin() {
  if (!(await isAdmin())) redirect("/admin/logowanie");
}

export async function logout() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

/** Zapis w dzienniku działań. Błąd zapisu nie przerywa operacji. */
export async function logAdmin(action: string, target?: string, details?: string, ip?: string) {
  try {
    const { connectDb } = await import("@/lib/db/mongoose");
    const { AdminLogModel } = await import("@/lib/models");
    if (!(await connectDb())) return;
    await AdminLogModel.create({
      action,
      target,
      details: details?.slice(0, 500),
      ipHash: ipHash(ip ?? (await clientIp())),
    });
  } catch (err) {
    console.error("[admin] Nie zapisano wpisu w dzienniku:", (err as Error).message);
  }
}
