import Link from "next/link";
import { Funnel, MonthlyLine } from "@/components/admin/charts";
import { DbMissing, Kpi, PageTitle, StatusBadge } from "@/components/admin/ui";
import { dateOnly, leadStatuses, pln } from "@/lib/admin/labels";
import { getDashboardStats } from "@/lib/admin/stats";
import { connectDb } from "@/lib/db/mongoose";
import { LeadModel } from "@/lib/models";

export const metadata = { title: "Sprzedaż" };

export default async function SalesPage() {
  const s = await getDashboardStats();
  if (!s.dbOk || !(await connectDb())) return <DbMissing />;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const won = (await LeadModel.find({ status: "wygrany" }).sort({ wonAt: -1 }).limit(15).lean()) as any[];
  const yearValue = s.sales.monthly.reduce((a, m) => a + m.value, 0);

  return (
    <>
      <PageTitle
        title="Sprzedaż"
        text="Wartości netto wpisane przy zgłoszeniach oznaczonych jako „Wygrany”. To umowy uzgodnione z klientami — nie zaksięgowane wpłaty (te pojawią się po podłączeniu płatności)."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Wygrane — 12 miesięcy" value={pln(yearValue)} hint={`${s.sales.monthly.reduce((a, m) => a + m.count, 0)} umów`} accent />
        <Kpi label="Wygrane — 30 dni" value={pln(s.sales.wonValue30)} />
        <Kpi label="Średnia wartość umowy" value={s.sales.avgDeal ? pln(s.sales.avgDeal) : "—"} hint={`Wygranych łącznie: ${s.sales.wonCount}`} />
        <Kpi
          label="Skuteczność"
          value={s.sales.winRate === null ? "—" : `${Math.round(s.sales.winRate * 100)}%`}
          hint={`${s.sales.wonCount} wygranych / ${s.sales.lostCount} przegranych`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="adm-card">
          <div className="flex items-center justify-between">
            <h2 className="adm-h">Wartość wygranych umów</h2>
            <span className="t-small t-faint">ostatnie 12 miesięcy, netto</span>
          </div>
          <div className="mt-5">
            <MonthlyLine data={s.sales.monthly} label="Wartość wygranych umów w kolejnych miesiącach" />
          </div>
        </section>
        <section className="adm-card">
          <h2 className="adm-h">Lejek</h2>
          <p className="t-small t-faint mt-1">Liczba zgłoszeń na każdym etapie</p>
          <div className="mt-5">
            <Funnel stages={leadStatuses.map((st) => ({ label: st.label, count: s.byStatus.find((b) => b.key === st.value)?.count ?? 0, tone: st.tone }))} />
          </div>
          <p className="t-small mt-5 border-t border-line pt-4 text-ink-2">
            Otwarte szanse: <strong className="text-ink">{pln(s.sales.pipelineValue)}</strong> w {s.sales.pipelineCount} zgłoszeniach
          </p>
        </section>
      </div>

      <section className="adm-card mt-4 overflow-hidden p-0 md:p-0">
        <h2 className="adm-h px-5 pt-5 md:px-6 md:pt-6">Ostatnio wygrane</h2>
        {won.length === 0 ? (
          <p className="t-small t-faint px-6 py-8">
            Brak wygranych umów. Oznacz zgłoszenie jako „Wygrany” i wpisz jego wartość w szczegółach, a pojawi się tutaj.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr><th>Numer</th><th>Klient</th><th>Wartość netto</th><th>Data wygrania</th><th>Status</th></tr>
              </thead>
              <tbody>
                {won.map((l) => (
                  <tr key={String(l._id)}>
                    <td><Link href={`/admin/zgloszenia/${String(l._id)}`} className="whitespace-nowrap font-semibold hover:text-accent-text">{l.number}</Link></td>
                    <td>{l.contact?.name}{l.company?.name && <span className="block text-xs text-ink-3">{l.company.name}</span>}</td>
                    <td className="tabular-nums">{typeof l.dealValue === "number" ? pln(l.dealValue) : <span className="text-danger">uzupełnij</span>}</td>
                    <td className="text-ink-3">{dateOnly(l.wonAt)}</td>
                    <td><StatusBadge status={l.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
