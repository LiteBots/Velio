import { DbMissing, PageTitle } from "@/components/admin/ui";
import { adminActionLabels, dateTime } from "@/lib/admin/labels";
import { connectDb } from "@/lib/db/mongoose";
import { AdminLogModel } from "@/lib/models";

export const metadata = { title: "Dziennik zmian" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function LogPage() {
  if (!(await connectDb())) return <DbMissing />;
  const logs = (await AdminLogModel.find({}).sort({ createdAt: -1 }).limit(300).lean()) as any[];
  const failed24 = logs.filter((l) => l.action === "logowanie_nieudane" && Date.now() - new Date(l.createdAt).getTime() < 86400000).length;

  return (
    <>
      <PageTitle
        title="Dziennik zmian"
        text="Ostatnie 300 działań w panelu: logowania, zmiany statusów, edycje oferty, eksporty. Adres IP zapisujemy tylko jako skrót."
      />
      {failed24 > 0 && (
        <div className="adm-card mb-5 border-[color-mix(in_srgb,var(--danger)_40%,var(--line))]">
          <p className="font-semibold text-danger">{failed24} nieudanych prób logowania w ciągu ostatnich 24 godzin.</p>
          <p className="t-small t-muted mt-1">Jeśli to nie Ty, zmień ADMIN_PIN w Railway → Variables. Zmiana kodu wyloguje wszystkie sesje.</p>
        </div>
      )}
      <div className="adm-card overflow-hidden p-0 md:p-0">
        {logs.length === 0 ? (
          <p className="t-small t-faint p-6">Brak wpisów.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr><th>Data</th><th>Działanie</th><th>Dotyczy</th><th>Szczegóły</th><th>Urządzenie</th></tr>
              </thead>
              <tbody>
                {logs.map((l) => (
                  <tr key={String(l._id)}>
                    <td className="whitespace-nowrap text-ink-3">{dateTime(l.createdAt)}</td>
                    <td className={l.action === "logowanie_nieudane" ? "font-semibold text-danger" : "font-semibold"}>{adminActionLabels[l.action] ?? l.action}</td>
                    <td className="text-ink-2">{l.target ?? "—"}</td>
                    <td className="text-ink-2">{l.details ?? ""}</td>
                    <td className="font-mono text-xs text-ink-3">{l.ipHash?.slice(0, 8)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
