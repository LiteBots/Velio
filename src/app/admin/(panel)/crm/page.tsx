import Link from "next/link";
import type { CSSProperties } from "react";
import { setLeadStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/forms";
import { DbMissing, PageTitle } from "@/components/admin/ui";
import { dateOnly, leadStatuses, pln } from "@/lib/admin/labels";
import { toRow, type LeadRow } from "@/lib/admin/leads";
import { connectDb } from "@/lib/db/mongoose";
import { LeadModel } from "@/lib/models";

export const metadata = { title: "CRM i lejek" };

/** Tablica lejka: kolumny = etapy. Zmiana etapu przez listę na karcie. */
export default async function CrmPage({ searchParams }: { searchParams: Promise<{ zamkniete?: string }> }) {
  const { zamkniete } = await searchParams;
  const showClosed = zamkniete === "1";
  if (!(await connectDb())) return <DbMissing />;

  const since = new Date(Date.now() - 90 * 86400000);
  const query = showClosed ? {} : { $or: [{ status: { $nin: ["wygrany", "przegrany"] } }, { updatedAt: { $gte: since } }] };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = (await LeadModel.find(query).sort({ updatedAt: -1 }).limit(600).lean()) as any[];
  const rows: LeadRow[] = raw.map(toRow);

  return (
    <>
      <PageTitle
        title="CRM i lejek sprzedaży"
        text="Każda karta to zgłoszenie. Przesuwaj je między etapami, zmieniając status. Wygrane i przegrane starsze niż 90 dni są ukryte."
        actions={
          <Link href={showClosed ? "/admin/crm" : "/admin/crm?zamkniete=1"} className="btn btn-outline btn-sm">
            {showClosed ? "Ukryj stare zamknięte" : "Pokaż wszystkie"}
          </Link>
        }
      />
      <div className="adm-board">
        {leadStatuses.map((st) => {
          const items = rows.filter((r) => r.status === st.value);
          const value = items.reduce((a, b) => a + (b.dealValue ?? 0), 0);
          return (
            <section key={st.value} className="adm-col" aria-label={st.label}>
              <header className="mb-3 flex items-center justify-between px-1">
                <h2 className="flex items-center gap-2 text-sm font-bold">
                  <span className="size-2.5 rounded-full" style={{ background: st.tone }} />
                  {st.label}
                  <span className="rounded-full bg-surface px-2 text-xs font-semibold text-ink-3">{items.length}</span>
                </h2>
                {value > 0 && <span className="text-xs font-semibold text-ink-3">{pln(value)}</span>}
              </header>
              <ul className="grid gap-2">
                {items.map((r, i) => (
                  <li key={r.id} className="enter" style={{ "--d": `${Math.min(i, 10) * 0.03}s` } as CSSProperties}>
                    <div className="adm-lead-card">
                      <Link href={`/admin/zgloszenia/${r.id}`} className="block">
                        <span className="block text-sm font-semibold hover:text-accent-text">{r.name}</span>
                        <span className="block text-xs text-ink-3">{r.company ?? r.email}</span>
                        <span className="mt-2 flex items-center justify-between text-xs text-ink-3">
                          <span>{r.number}</span>
                          {r.dealValue !== null && <span className="font-semibold text-ink">{pln(r.dealValue)}</span>}
                        </span>
                        {r.nextContactAt && (
                          <span className={`mt-1 block text-xs ${new Date(r.nextContactAt).getTime() < Date.now() ? "text-danger" : "text-accent-text"}`}>
                            Kontakt: {dateOnly(r.nextContactAt)}
                          </span>
                        )}
                      </Link>
                      <div className="mt-2.5">
                        <StatusSelect id={r.id} status={r.status} action={setLeadStatus} />
                      </div>
                    </div>
                  </li>
                ))}
                {items.length === 0 && <li className="px-1 py-6 text-center text-xs text-ink-3">Pusto</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </>
  );
}
