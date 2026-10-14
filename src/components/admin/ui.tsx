import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { statusLabel, statusTone } from "@/lib/admin/labels";

export function PageTitle({ title, text, actions }: { title: string; text?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div>
        <h1 className="text-[clamp(1.6rem,1.2rem+1.4vw,2.3rem)] font-extrabold tracking-[-0.04em]">{title}</h1>
        {text && <p className="t-muted mt-1.5 max-w-2xl text-[0.95rem]">{text}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className="adm-badge" style={{ "--tone": statusTone(status) } as CSSProperties}>
      {statusLabel(status)}
    </span>
  );
}

export function Kpi({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: ReactNode; accent?: boolean }) {
  return (
    <div className={`adm-card adm-kpi ${accent ? "border-transparent bg-accent text-white shadow-[0_20px_60px_-25px_var(--accent-glow)]" : ""}`}>
      <p className={`text-sm ${accent ? "text-white/80" : "text-ink-3"}`}>{label}</p>
      <p className="v mt-2">{value}</p>
      {hint && <p className={`mt-2 text-xs ${accent ? "text-white/75" : "text-ink-3"}`}>{hint}</p>}
    </div>
  );
}

export function Trend({ now, prev, light }: { now: number; prev: number; light?: boolean }) {
  if (prev === 0) return <span>{now > 0 ? "pierwsze zgłoszenia w tym okresie" : "brak zgłoszeń"}</span>;
  const diff = Math.round(((now - prev) / prev) * 100);
  return (
    <span className={light ? "font-semibold text-white" : diff >= 0 ? "text-success" : "text-danger"}>
      {diff >= 0 ? "▲" : "▼"} {Math.abs(diff)}% vs poprzednie 30 dni
    </span>
  );
}

export function DbMissing() {
  return (
    <div className="adm-card max-w-xl">
      <p className="adm-h">Brak połączenia z bazą danych</p>
      <p className="t-muted mt-2 text-sm">
        Panel pokazuje dane z MongoDB. Sprawdź zmienną <code className="rounded bg-surface-2 px-1">MONGODB_URI</code> w Railway → Variables i stan bazy w{" "}
        <Link href="/admin/ustawienia" className="link-u">Ustawieniach</Link>.
      </p>
    </div>
  );
}

export function Empty({ title, text, action }: { title: string; text: ReactNode; action?: ReactNode }) {
  return (
    <div className="adm-card grid place-items-center py-14 text-center">
      <p className="adm-h">{title}</p>
      <p className="t-muted mt-2 max-w-md text-sm">{text}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
