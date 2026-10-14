import Link from "next/link";
import { Download, Search } from "lucide-react";
import { setLeadStatus } from "@/app/admin/actions";
import { StatusSelect } from "@/components/admin/forms";
import { DbMissing, Empty, PageTitle } from "@/components/admin/ui";
import { dateTime, formTypeLabels, leadStatuses, pln } from "@/lib/admin/labels";
import { listLeads, type LeadFilters } from "@/lib/admin/leads";

export const metadata = { title: "Zgłoszenia" };

type Props = { searchParams: Promise<Record<string, string | undefined>> };

export default async function LeadsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const filters: LeadFilters = {
    q: sp.q,
    status: sp.status,
    form: sp.form,
    from: sp.od,
    to: sp.do,
    page: Number(sp.strona) || 1,
  };
  const data = await listLeads(filters);
  if (!data) {
    return (
      <>
        <PageTitle title="Zgłoszenia" />
        <DbMissing />
      </>
    );
  }

  const qs = (patch: Record<string, string | number | undefined>) => {
    const p = new URLSearchParams();
    const merged = { q: sp.q, status: sp.status, form: sp.form, od: sp.od, do: sp.do, strona: sp.strona, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v !== undefined && v !== "") p.set(k, String(v));
    const s = p.toString();
    return s ? `?${s}` : "";
  };
  const exportHref = `/api/admin/eksport${qs({ strona: undefined })}`;
  const hasFilters = Boolean(sp.q || sp.status || sp.form || sp.od || sp.do);

  return (
    <>
      <PageTitle
        title="Zgłoszenia"
        text="Wszystkie formularze ze strony: wycena, kontakt, zapytania o usługi, druk i automatyzacje."
        actions={
          <a href={exportHref} className="btn btn-outline btn-sm">
            <Download size={16} aria-hidden="true" /> Eksport CSV
          </a>
        }
      />

      {/* szybkie filtry statusu */}
      <nav aria-label="Status" className="adm-tabs mb-5">
        <Link href={`/admin/zgloszenia${qs({ status: undefined, strona: undefined })}`} aria-current={!sp.status ? "page" : undefined}>
          Wszystkie
        </Link>
        {leadStatuses.map((s) => (
          <Link key={s.value} href={`/admin/zgloszenia${qs({ status: s.value, strona: undefined })}`} aria-current={sp.status === s.value ? "page" : undefined}>
            {s.label}
          </Link>
        ))}
      </nav>

      <form className="adm-card mb-5 grid gap-3 md:grid-cols-[1.6fr_1fr_0.8fr_0.8fr_auto] md:items-end" role="search">
        {sp.status && <input type="hidden" name="status" value={sp.status} />}
        <div>
          <label className="adm-label" htmlFor="q">Szukaj</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
            <input id="q" name="q" defaultValue={sp.q} placeholder="Numer, imię, e-mail, firma, treść…" className="adm-input pl-9" />
          </div>
        </div>
        <div>
          <label className="adm-label" htmlFor="form">Formularz</label>
          <select id="form" name="form" defaultValue={sp.form ?? ""} className="adm-input">
            <option value="">Wszystkie</option>
            {Object.entries(formTypeLabels).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="adm-label" htmlFor="od">Od</label>
          <input id="od" name="od" type="date" defaultValue={sp.od} className="adm-input" />
        </div>
        <div>
          <label className="adm-label" htmlFor="do">Do</label>
          <input id="do" name="do" type="date" defaultValue={sp.do} className="adm-input" />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-ink btn-sm">Filtruj</button>
          {hasFilters && <Link href="/admin/zgloszenia" className="btn btn-ghost btn-sm">Wyczyść</Link>}
        </div>
      </form>

      {data.rows.length === 0 ? (
        <Empty
          title={hasFilters ? "Brak wyników dla tych filtrów" : "Jeszcze nie ma zgłoszeń"}
          text={hasFilters ? "Zmień kryteria wyszukiwania albo wyczyść filtry." : "Zgłoszenia z formularzy na stronie pojawią się tutaj automatycznie."}
          action={hasFilters ? <Link href="/admin/zgloszenia" className="btn btn-outline btn-sm">Wyczyść filtry</Link> : undefined}
        />
      ) : (
        <div className="adm-card overflow-hidden p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Numer</th>
                  <th>Klient</th>
                  <th>Kontakt</th>
                  <th>Formularz</th>
                  <th>Wartość</th>
                  <th>Status</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {data.rows.map((l) => (
                  <tr key={l.id}>
                    <td>
                      <Link href={`/admin/zgloszenia/${l.id}`} className="whitespace-nowrap font-semibold hover:text-accent-text">{l.number}</Link>
                    </td>
                    <td>
                      <Link href={`/admin/zgloszenia/${l.id}`} className="hover:text-accent-text">{l.name}</Link>
                      {l.company && <span className="block text-xs text-ink-3">{l.company}</span>}
                    </td>
                    <td className="text-ink-2">
                      <a href={`mailto:${l.email}`} className="hover:text-ink">{l.email}</a>
                      {l.phone && <a href={`tel:${l.phone.replace(/\s/g, "")}`} className="block text-xs text-ink-3 hover:text-ink">{l.phone}</a>}
                    </td>
                    <td className="text-ink-2">{formTypeLabels[l.formType] ?? l.formType}</td>
                    <td className="whitespace-nowrap tabular-nums">{l.dealValue !== null ? pln(l.dealValue) : <span className="text-ink-3">—</span>}</td>
                    <td className="min-w-[170px]">
                      <StatusSelect id={l.id} status={l.status} action={setLeadStatus} />
                    </td>
                    <td className="whitespace-nowrap text-ink-3">{dateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 text-sm text-ink-3">
            <span>
              {data.total} {data.total === 1 ? "zgłoszenie" : "zgłoszeń"}, strona {data.page} z {data.pages}
            </span>
            <span className="flex gap-2">
              {data.page > 1 && <Link className="btn btn-outline btn-sm" href={`/admin/zgloszenia${qs({ strona: data.page - 1 })}`}>Poprzednia</Link>}
              {data.page < data.pages && <Link className="btn btn-outline btn-sm" href={`/admin/zgloszenia${qs({ strona: data.page + 1 })}`}>Następna</Link>}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
