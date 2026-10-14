"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useEffect, useRef, useState } from "react";
import { loginAction, type ActionState } from "@/app/admin/actions";

/** Pola na kolejne cyfry kodu. Po wpisaniu ostatniej cyfry formularz wysyła się sam. */
export function PinForm({ length }: { length: number }) {
  const [state, action, pending] = useActionState<ActionState, FormData>(loginAction, {});
  const [digits, setDigits] = useState<string[]>(() => Array(length).fill(""));
  const [shake, setShake] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    refs.current[0]?.focus();
  }, []);

  // po błędzie: potrząśnij polami i wyczyść kod
  useEffect(() => {
    if (!state.error) return;
    setShake(true);
    setDigits(Array(length).fill(""));
    const t = setTimeout(() => {
      setShake(false);
      refs.current[0]?.focus();
    }, 450);
    return () => clearTimeout(t);
  }, [state, length]);

  const setAt = (i: number, v: string) => {
    const clean = v.replace(/\D/g, "");
    if (clean.length > 1) {
      // wklejony cały kod
      const next = clean.slice(0, length).split("");
      while (next.length < length) next.push("");
      setDigits(next);
      const last = Math.min(clean.length, length) - 1;
      refs.current[last]?.focus();
      if (clean.length >= length) setTimeout(() => formRef.current?.requestSubmit(), 50);
      return;
    }
    const next = [...digits];
    next[i] = clean;
    setDigits(next);
    if (clean && i < length - 1) refs.current[i + 1]?.focus();
    if (clean && next.every(Boolean)) setTimeout(() => formRef.current?.requestSubmit(), 50);
  };

  return (
    <form ref={formRef} action={action} className="grid gap-6">
      <input type="hidden" name="pin" value={digits.join("")} />
      <fieldset className={`pin-boxes ${shake ? "pin-shake" : ""}`} disabled={pending}>
        <legend className="sr-only">Kod dostępu</legend>
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            className="pin-box"
            type="password"
            inputMode="numeric"
            autoComplete={i === 0 ? "one-time-code" : "off"}
            maxLength={length}
            value={d}
            aria-label={`Cyfra ${i + 1} z ${length}`}
            onChange={(e) => setAt(i, e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "ArrowLeft" && i > 0) refs.current[i - 1]?.focus();
              if (e.key === "ArrowRight" && i < length - 1) refs.current[i + 1]?.focus();
            }}
          />
        ))}
      </fieldset>
      <div aria-live="polite" className="min-h-6 text-sm font-medium text-danger">
        {state.error}
      </div>
      <button type="submit" className="btn btn-primary btn-lg w-full" disabled={pending || !digits.every(Boolean)}>
        {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
        {pending ? "Sprawdzanie…" : "Zaloguj"}
      </button>
    </form>
  );
}
