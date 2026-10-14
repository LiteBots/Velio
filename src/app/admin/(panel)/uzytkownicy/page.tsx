import { Search } from "lucide-react";
import { setUserRole, setUserStatus } from "@/app/admin/actions";
import { DbMissing, Kpi, PageTitle } from "@/components/admin/ui";
import { dateTime } from "@/lib/admin/labels";
import { connectDb } from "@/lib/db/mongoose";
import { UserModel } from "@/lib/models";

export const metadata = { title: "Konta użytkowników" };

const roleLabels: Record<string, string> = {
  owner: "Właściciel",
  admin: "Administrator",
  manager: "Manager",
  specialist: "Specjalista",
  client: "Klient",
};

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function UsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  if (!(await connectDb())) return <DbMissing />;
  const filter = q?.trim() ? { $or: [{ email: new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }, { name: new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") }] } : {};
  const [usersRaw, total, clients, team, blocked] = await Promise.all([
    UserModel.find(filter).sort({ createdAt: -1 }).limit(200).lean(),
    UserModel.countDocuments({}),
    UserModel.countDocuments({ role: "client" }),
    UserModel.countDocuments({ role: { $ne: "client" } }),
    UserModel.countDocuments({ status: "blocked" }),
  ]);
  const users = usersRaw as any[];

  return (
    <>
      <PageTitle
        title="Konta użytkowników"
        text="Konta klientów i zespołu. Klienci zakładają konta przez rejestrację na stronie — ta funkcja zostanie uruchomiona w etapie 2 (panel klienta). Do tego czasu lista będzie pusta."
      />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi label="Wszystkie konta" value={total} />
        <Kpi label="Klienci" value={clients} />
        <Kpi label="Zespół" value={team} />
        <Kpi label="Zablokowane" value={blocked} />
      </div>

      <form className="adm-card mb-5 flex gap-2" role="search">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" aria-hidden="true" />
          <label className="sr-only" htmlFor="uq">Szukaj konta</label>
          <input id="uq" name="q" defaultValue={q} placeholder="E-mail lub imię" className="adm-input pl-9" />
        </div>
        <button type="submit" className="btn btn-ink btn-sm">Szukaj</button>
      </form>

      {users.length === 0 ? (
        <div className="adm-card py-12 text-center">
          <p className="adm-h">{q ? "Brak kont dla tego wyszukiwania" : "Nie ma jeszcze żadnych kont"}</p>
          <p className="t-muted mx-auto mt-2 max-w-md text-sm">
            Po uruchomieniu rejestracji (etap 2) każde nowe konto pojawi się tutaj. Będziesz mógł zmieniać role i blokować dostęp.
          </p>
        </div>
      ) : (
        <div className="adm-card overflow-hidden p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr><th>Użytkownik</th><th>Rola</th><th>Status</th><th>Utworzone</th><th>Ostatnie logowanie</th><th /></tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={String(u._id)}>
                    <td>
                      <span className="font-semibold">{u.name ?? "—"}</span>
                      <span className="block text-xs text-ink-3">{u.email}{u.company ? `, ${u.company}` : ""}</span>
                    </td>
                    <td>
                      {u.role === "owner" ? (
                        roleLabels.owner
                      ) : (
                        <form action={setUserRole} className="flex gap-1.5">
                          <input type="hidden" name="id" value={String(u._id)} />
                          <select name="role" defaultValue={u.role} className="adm-input min-h-9 py-1 text-sm" aria-label="Rola">
                            {["client", "specialist", "manager", "admin"].map((r) => <option key={r} value={r}>{roleLabels[r]}</option>)}
                          </select>
                          <button type="submit" className="btn btn-ghost btn-sm">Zmień</button>
                        </form>
                      )}
                    </td>
                    <td>{u.status === "blocked" ? <span className="tag text-danger">Zablokowane</span> : <span className="tag tag-accent">Aktywne</span>}</td>
                    <td className="text-ink-3">{dateTime(u.createdAt)}</td>
                    <td className="text-ink-3">{dateTime(u.lastLoginAt)}</td>
                    <td className="text-right">
                      <form action={setUserStatus}>
                        <input type="hidden" name="id" value={String(u._id)} />
                        <input type="hidden" name="status" value={u.status === "blocked" ? "active" : "blocked"} />
                        <button type="submit" className={`btn btn-sm ${u.status === "blocked" ? "btn-outline" : "btn-ghost text-danger"}`}>
                          {u.status === "blocked" ? "Odblokuj" : "Zablokuj"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
