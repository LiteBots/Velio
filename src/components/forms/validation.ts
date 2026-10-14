import type { ZodIssue } from "zod";

/** Zamienia błędy zod na mapę „ścieżka → pierwszy komunikat”, np. { "contact.email": "Podaj poprawny…" }. */
export function issuesToMap(issues: ZodIssue[]) {
  const map: Record<string, string> = {};
  for (const i of issues) {
    const key = i.path.join(".");
    if (!map[key]) map[key] = i.message;
  }
  return map;
}
