"use client";

import { LoaderCircle } from "lucide-react";
import { useActionState, useRef, type ReactNode } from "react";
import { useFormStatus } from "react-dom";
import type { ActionState } from "@/app/admin/actions";
import { leadStatuses } from "@/lib/admin/labels";

/** Lista statusów zapisująca się od razu po zmianie. */
export function StatusSelect({ id, status, action }: { id: string; status: string; action: (f: FormData) => Promise<void> }) {
  const ref = useRef<HTMLFormElement>(null);
  return (
    <form ref={ref} action={action}>
      <input type="hidden" name="id" value={id} />
      <label className="sr-only" htmlFor={`st-${id}`}>Status</label>
      <select
        id={`st-${id}`}
        name="status"
        defaultValue={status}
        className="adm-input min-h-9 py-1 text-sm"
        onChange={() => ref.current?.requestSubmit()}
      >
        {leadStatuses.map((s) => (
          <option key={s.value} value={s.value}>{s.label}</option>
        ))}
      </select>
    </form>
  );
}

export function SubmitButton({ children, className = "btn btn-primary btn-sm", pendingText = "Zapisywanie…" }: { children: ReactNode; className?: string; pendingText?: string }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={className} disabled={pending}>
      {pending && <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />}
      {pending ? pendingText : children}
    </button>
  );
}

/** Formularz akcji z komunikatem o wyniku (zapisano / błąd). */
export function ActionForm({
  action,
  children,
  className = "grid gap-4",
  resetOnSuccess = false,
}: {
  action: (prev: ActionState, f: FormData) => Promise<ActionState>;
  children: ReactNode;
  className?: string;
  resetOnSuccess?: boolean;
}) {
  const ref = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState<ActionState, FormData>(async (prev, f) => {
    const r = await action(prev, f);
    if (r.ok && resetOnSuccess) ref.current?.reset();
    return r;
  }, {});
  return (
    <form ref={ref} action={formAction} className={className}>
      {children}
      <div aria-live="polite" className="min-h-5 text-sm font-medium">
        {state.error && <span className="text-danger">{state.error}</span>}
        {state.ok && <span className="text-success">{state.message ?? "Zapisano."}</span>}
      </div>
    </form>
  );
}

/** Przycisk usuwania z potwierdzeniem w przeglądarce. */
export function ConfirmButton({ children, message, className = "btn btn-ghost btn-sm text-danger" }: { children: ReactNode; message: string; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!window.confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
