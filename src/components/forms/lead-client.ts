import type { LeadInput } from "@/lib/leads/schema";

export type SubmitResult =
  | { ok: true; number: string | null }
  | { ok: false; error: string; fields?: Record<string, string[] | undefined> };

/** Wysyła zgłoszenie do /api/leads. Błędy sieci zamienia na czytelny komunikat. */
export async function submitLead(payload: LeadInput): Promise<SubmitResult> {
  try {
    const res = await fetch("/api/leads", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...payload,
        source: { page: window.location.pathname + window.location.search, referrer: document.referrer || undefined },
      }),
    });
    const data = (await res.json().catch(() => null)) as SubmitResult | null;
    if (!data) return { ok: false, error: "Serwer zwrócił nieoczekiwaną odpowiedź. Spróbuj ponownie." };
    return data;
  } catch {
    return { ok: false, error: "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie." };
  }
}
