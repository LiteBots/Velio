import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/leads/schema";
import { LeadStorageUnavailable, saveLead } from "@/lib/leads/service";
import { clientIp, rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MIN_FILL_MS = 3000; // formularz wypełniony szybciej niż w 3 s to niemal na pewno bot

export async function POST(req: Request) {
  const ip = clientIp(req.headers);

  const limit = rateLimit(`lead:${ip}`, 5, 10 * 60 * 1000);
  if (!limit.ok) {
    return NextResponse.json(
      { ok: false, error: "Wysłano zbyt wiele zgłoszeń z tego adresu. Spróbuj ponownie za kilka minut." },
      { status: 429, headers: { "Retry-After": String(limit.retryAfter) } },
    );
  }

  const contentLength = Number(req.headers.get("content-length") ?? "0");
  if (contentLength > 32_000) {
    return NextResponse.json({ ok: false, error: "Zgłoszenie jest zbyt duże." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Nieprawidłowy format danych." }, { status: 400 });
  }

  // honeypot i czas wypełnienia: odpowiadamy „sukcesem”, ale nic nie zapisujemy
  const raw = body as { website_url?: string; startedAt?: number };
  if (raw?.website_url || (typeof raw?.startedAt === "number" && Date.now() - raw.startedAt < MIN_FILL_MS)) {
    return NextResponse.json({ ok: true, number: null });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Sprawdź zaznaczone pola.", fields: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  try {
    const { number } = await saveLead(parsed.data, ip);
    return NextResponse.json({ ok: true, number }, { status: 201 });
  } catch (err) {
    if (err instanceof LeadStorageUnavailable) {
      console.error("[leads]", err.message);
      return NextResponse.json(
        { ok: false, error: "Formularz jest chwilowo niedostępny. Napisz do nas bezpośrednio na adres podany w stopce." },
        { status: 503 },
      );
    }
    console.error("[leads] Błąd zapisu zgłoszenia:", err);
    return NextResponse.json(
      { ok: false, error: "Nie udało się zapisać zgłoszenia. Spróbuj ponownie za chwilę." },
      { status: 500 },
    );
  }
}
