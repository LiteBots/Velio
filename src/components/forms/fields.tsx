"use client";

import Link from "next/link";
import { Check, CircleAlert, CircleCheck } from "lucide-react";
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { useId } from "react";

type Base = { label: string; hint?: string; error?: string; optional?: boolean };

export function TextField({ label, hint, error, optional, ...props }: Base & InputHTMLAttributes<HTMLInputElement>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-ink-3">(opcjonalnie)</span>}
      </label>
      <input
        id={id}
        className="input"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        {...props}
      />
      {hint && !error && <p id={`${id}-h`} className="hint">{hint}</p>}
      {error && <p id={`${id}-e`} className="error-text">{error}</p>}
    </div>
  );
}

export function TextArea({ label, hint, error, optional, ...props }: Base & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-ink-3">(opcjonalnie)</span>}
      </label>
      <textarea
        id={id}
        className="textarea"
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-e` : hint ? `${id}-h` : undefined}
        {...props}
      />
      {hint && !error && <p id={`${id}-h`} className="hint">{hint}</p>}
      {error && <p id={`${id}-e`} className="error-text">{error}</p>}
    </div>
  );
}

export function SelectField({
  label,
  hint,
  error,
  optional,
  options,
  placeholder = "Wybierz…",
  ...props
}: Base & SelectHTMLAttributes<HTMLSelectElement> & { options: readonly { value: string; label: string }[]; placeholder?: string }) {
  const id = useId();
  return (
    <div className="field">
      <label htmlFor={id} className="label">
        {label} {optional && <span className="font-normal text-ink-3">(opcjonalnie)</span>}
      </label>
      <select id={id} className="select" aria-invalid={error ? true : undefined} {...props}>
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {hint && !error && <p className="hint">{hint}</p>}
      {error && <p className="error-text">{error}</p>}
    </div>
  );
}

export function Choice({
  type,
  label,
  checked,
  onChange,
  name,
}: {
  type: "checkbox" | "radio";
  label: string;
  checked: boolean;
  onChange: () => void;
  name: string;
}) {
  return (
    <label className="choice" data-type={type}>
      <input type={type} name={name} checked={checked} onChange={onChange} />
      <span className="box"><Check size={13} strokeWidth={3} aria-hidden="true" /></span>
      <span>{label}</span>
    </label>
  );
}

/** Ukryte pole-pułapka dla botów. Prawdziwy użytkownik go nie widzi ani nie osiąga klawiaturą. */
export function Honeypot({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div aria-hidden="true" style={{ position: "absolute", left: "-10000px", width: 1, height: 1, overflow: "hidden" }}>
      <label>
        Nie wypełniaj tego pola
        <input type="text" tabIndex={-1} autoComplete="off" value={value} onChange={(e) => onChange(e.target.value)} name="website_url" />
      </label>
    </div>
  );
}

export function Consents({
  privacy,
  marketing,
  onPrivacy,
  onMarketing,
  error,
}: {
  privacy: boolean;
  marketing: boolean;
  onPrivacy: (v: boolean) => void;
  onMarketing: (v: boolean) => void;
  error?: string;
}) {
  return (
    <div className="grid gap-3">
      <label className="checkline">
        <input type="checkbox" checked={privacy} onChange={(e) => onPrivacy(e.target.checked)} aria-invalid={error ? true : undefined} />
        <span>
          Wyrażam zgodę na przetwarzanie moich danych w celu odpowiedzi na zapytanie, zgodnie z{" "}
          <Link href="/polityka-prywatnosci" className="link-u" target="_blank">polityką prywatności</Link>. <span className="text-ink-3">(wymagane)</span>
        </span>
      </label>
      {error && <p className="error-text -mt-1 pl-7">{error}</p>}
      <label className="checkline">
        <input type="checkbox" checked={marketing} onChange={(e) => onMarketing(e.target.checked)} />
        <span>Chcę otrzymywać od VELIO informacje o nowych usługach i poradnikach. Zgodę mogę wycofać w każdej chwili.</span>
      </label>
    </div>
  );
}

export function FormAlert({ tone, children }: { tone: "error" | "success"; children: ReactNode }) {
  const Icon = tone === "error" ? CircleAlert : CircleCheck;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-[var(--radius-sm)] p-4 text-[0.95rem] ${
        tone === "error" ? "bg-[var(--danger-soft)] text-danger" : "bg-accent-soft text-ink"
      }`}
    >
      <Icon size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
      <div>{children}</div>
    </div>
  );
}

/** Ekran potwierdzenia po wysłaniu formularza. */
export function SubmittedState({ number, onReset }: { number: string | null; onReset?: () => void }) {
  return (
    <div role="status" className="enter rounded-[var(--radius-lg)] border border-line bg-surface p-8 md:p-10">
      <span className="grid size-12 place-items-center rounded-full bg-accent text-white">
        <Check size={24} strokeWidth={2.4} aria-hidden="true" />
      </span>
      <h3 className="t-h3 mt-6">Zgłoszenie wysłane.</h3>
      {number && (
        <p className="mt-3">
          Numer zgłoszenia: <strong className="font-bold tracking-tight">{number}</strong>
        </p>
      )}
      <p className="t-muted mt-3 max-w-md">
        Odpowiemy na podany adres e-mail. Jeśli zechcesz coś dopisać, odpowiedz na naszą wiadomość{number ? " i podaj numer zgłoszenia" : ""}.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        <Link href="/" className="btn btn-ink">Wróć na stronę główną</Link>
        {onReset && (
          <button type="button" className="btn btn-outline" onClick={onReset}>Wyślij kolejne zgłoszenie</button>
        )}
      </div>
    </div>
  );
}
