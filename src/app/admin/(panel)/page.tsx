import Link from "next/link";
import { ArrowUpRight, CalendarClock } from "lucide-react";
import { BarList, DailyBars } from "@/components/admin/charts";
import { DbMissing, Kpi, PageTitle, StatusBadge, Trend } from "@/components/admin/ui";
import { budgetOptions, needOptions } from "@/lib/leads/schema";
import { dateTime, formTypeLabels, leadStatuses, pln } from "@/lib/admin/labels";
import { getDashboardStats } from "@/lib/admin/stats";

export const metadata = { title: "Pulpit" };

export default async function AdminDashboard() {
  const s = await getDashboardStats();
  if (!s.dbOk) {
    return (
      <>
        <PageTitle title="Pulpit" />
        <DbMissing />
      </>
    );
  }

  const newCount = s.byStatus.find((b) => b.key === "nowy")?.count ?? 0;

  return (
    <>
      <PageTitle
        title="Dzień dobry"
        text={`Masz ${newCount} ${newCount === 1 ? "nowe zgłoszenie" : "nowych zgłoszeń"} do obsłużenia.`}
        actions={
          <Link href="/admin/zgloszenia?status=nowy" className="btn btn-primary btn-sm">
            Obsłuż nowe <ArrowUpRight size={16} className="btn-icon" aria-hidden="true" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Zgłoszenia — ostatnie 30 dni" value={s.leads.d30} hint={<Trend now={s.leads.d30} prev={s.leads.prev30} light />} accent />
        <Kpi label="Dziś / 7 dni" value={`${s.leads.today} / ${s.leads.d7}`} hint={`Wszystkich zgłoszeń: ${s.leads.total}`} />
        <Kpi label="Sprzedaż — 30 dni" value={pln(s.sales.wonValue30)} hint={`Łącznie wygrane: ${pln(s.sales.wonValue)}`} />
        <Kpi
          label="Otwarte szanse"
          value={pln(s.sales.pipelineValue)}
          hint={`${s.sales.pipelineCount} w lejku, skuteczność ${s.sales.winRate === null ? "—" : `${Math.round(s.sales.winRate * 100)}%`}`}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr] xl:items-start">
        <section className="adm-card">
          <div className="flex items-center justify-between">
            <h2 className="adm-h">Zgłoszenia dziennie</h2>
            <span className="t-small t-faint">ostatnie 30 dni</span>
          </div>
          <div className="mt-5">
            <DailyBars data={s.daily} label="Liczba zgłoszeń dziennie w ostatnich 30 dniach" />
          </div>
        </section>
        <section className="adm-card">
          <h2 className="adm-h">Status zgłoszeń</h2>
          <div className="mt-5">
            <BarList
              items={leadStatuses
                .map((st) => ({ label: st.label, count: s.byStatus.find((b) => b.key === st.value)?.count ?? 0, tone: st.tone }))
                .filter((i) => i.count > 0)}
            />
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="adm-card overflow-hidden p-0 md:p-0">
          <div className="flex items-center justify-between px-5 pt-5 md:px-6 md:pt-6">
            <h2 className="adm-h">Ostatnie zgłoszenia</h2>
            <Link href="/admin/zgloszenia" className="link-u text-sm">Wszystkie</Link>
          </div>
          {s.recent.length === 0 ? (
            <p className="t-small t-faint px-6 py-8">Jeszcze nie ma zgłoszeń. Pojawią się tu od razu po wysłaniu formularza na stronie.</p>
          ) : (
            <div className="mt-3 overflow-x-auto">
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Numer</th>
                    <th>Klient</th>
                    <th>Formularz</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {s.recent.map((l) => (
                    <tr key={l.id}>
                      <td>
                        <Link href={`/admin/zgloszenia/${l.id}`} className="whitespace-nowrap font-semibold hover:text-accent-text">{l.number}</Link>
                      </td>
                      <td>
                        {l.name}
                        {l.company && <span className="block text-xs text-ink-3">{l.company}</span>}
                      </td>
                      <td className="text-ink-2">{formTypeLabels[l.formType] ?? l.formType}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td className="whitespace-nowrap text-ink-3">{dateTime(l.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="adm-card">
          <h2 className="adm-h flex items-center gap-2">
            <CalendarClock size={18} className="text-accent-text" aria-hidden="true" /> Zaplanowane kontakty
          </h2>
          {s.upcoming.length === 0 ? (
            <p className="t-small t-faint mt-4">Brak zaplanowanych kontaktów na najbliższe 7 dni. Datę ustawisz w szczegółach zgłoszenia.</p>
          ) : (
            <ul className="mt-4 grid gap-2">
              {s.upcoming.map((u) => {
                const overdue = new Date(u.nextContactAt).getTime() < Date.now();
                return (
                  <li key={u.id}>
                    <Link href={`/admin/zgloszenia/${u.id}`} className="adm-lead-card">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold">{u.name}</span>
                        <span className={`text-xs font-semibold ${overdue ? "text-danger" : "text-accent-text"}`}>{overdue ? "Zaległe" : dateTime(u.nextContactAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-ink-3">{u.number}{u.company ? `, ${u.company}` : ""}</p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <section className="adm-card">
          <h2 className="adm-h">Czego szukają klienci</h2>
          <div className="mt-5">
            <BarList items={s.byNeed.map((b) => ({ label: needOptions.find((o) => o.value === b.key)?.label ?? b.key, count: b.count }))} />
          </div>
        </section>
        <section className="adm-card">
          <h2 className="adm-h">Deklarowany budżet</h2>
          <div className="mt-5">
            <BarList
              color="#3cc8d8"
              items={s.byBudget.map((b) => ({ label: budgetOptions.find((o) => o.value === b.key)?.label ?? (b.key === "brak" ? "Nie podano" : b.key), count: b.count }))}
            />
          </div>
        </section>
        <section className="adm-card">
          <h2 className="adm-h">Źródło zgłoszenia</h2>
          <div className="mt-5">
            <BarList color="#3ccf95" items={s.byForm.map((b) => ({ label: formTypeLabels[b.key] ?? b.key, count: b.count }))} />
          </div>
        </section>
      </div>
    </>
  );
}
