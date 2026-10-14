"use client";

import { useEffect, useState } from "react";
import { FormAlert } from "@/components/forms/fields";
import { readConsent, writeConsent } from "@/lib/consent";

const categories = [
  {
    key: "necessary" as const,
    name: "Niezbędne",
    text: "Zapamiętanie wybranego motywu i Twojej decyzji o cookies. Bez nich strona nie działa poprawnie, dlatego są zawsze włączone.",
    locked: true,
  },
  {
    key: "analytics" as const,
    name: "Analityczne",
    text: "Pomagają zrozumieć, jak korzystasz ze strony (np. Google Analytics). Obecnie strona nie używa narzędzi analitycznych — zgoda zostanie zastosowana po ich włączeniu.",
    locked: false,
  },
  {
    key: "marketing" as const,
    name: "Marketingowe",
    text: "Pozwalają mierzyć skuteczność reklam i wyświetlać dopasowane reklamy (np. Meta Pixel). Obecnie nieaktywne — zgoda zostanie zastosowana po ich włączeniu.",
    locked: false,
  },
];

export function CookieSettings() {
  const [state, setState] = useState({ analytics: false, marketing: false });
  const [saved, setSaved] = useState<string | null>(null);

  useEffect(() => {
    const c = readConsent();
    if (c) setState({ analytics: c.analytics, marketing: c.marketing });
  }, []);

  const save = (next = state) => {
    const c = writeConsent(next);
    setState({ analytics: c.analytics, marketing: c.marketing });
    setSaved(new Date(c.updatedAt).toLocaleString("pl-PL"));
  };

  return (
    <div>
      <ul className="border-t border-line">
        {categories.map((c) => {
          const checked = c.locked ? true : state[c.key as "analytics" | "marketing"];
          const id = `cookie-${c.key}`;
          return (
            <li key={c.key} className="flex items-start justify-between gap-6 border-b border-line py-6">
              <div>
                <label htmlFor={id} className="font-bold">{c.name}</label>
                <p className="t-small t-muted mt-1 max-w-xl">{c.text}</p>
              </div>
              <button
                id={id}
                type="button"
                role="switch"
                aria-checked={checked}
                disabled={c.locked}
                onClick={() => !c.locked && setState((s) => ({ ...s, [c.key]: !checked }))}
                className={`relative mt-1 h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-60 ${checked ? "bg-accent" : "bg-line-strong"}`}
              >
                <span className={`absolute top-1 size-5 rounded-full bg-white transition-[left] ${checked ? "left-6" : "left-1"}`} />
                <span className="sr-only">{checked ? "Włączone" : "Wyłączone"}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <div className="mt-8 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ink" onClick={() => save()}>Zapisz wybór</button>
        <button type="button" className="btn btn-outline" onClick={() => save({ analytics: true, marketing: true })}>Akceptuję wszystkie</button>
        <button type="button" className="btn btn-ghost" onClick={() => save({ analytics: false, marketing: false })}>Tylko niezbędne</button>
      </div>
      {saved && (
        <div className="mt-6">
          <FormAlert tone="success">Zapisano ustawienia ({saved}).</FormAlert>
        </div>
      )}
    </div>
  );
}
