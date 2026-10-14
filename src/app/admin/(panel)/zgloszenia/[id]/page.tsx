import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Phone, Trash2 } from "lucide-react";
import { addLeadNote, deleteLead, deleteLeadNote, setLeadStatus, updateLead } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, StatusSelect, SubmitButton } from "@/components/admin/forms";
import { DbMissing, StatusBadge } from "@/components/admin/ui";
import { dateTime, formTypeLabels, statusLabel } from "@/lib/admin/labels";
import { connectDb } from "@/lib/db/mongoose";
import { budgetOptions, needOptions, sizeOptions, timelineOptions } from "@/lib/leads/schema";
import { LeadModel } from "@/lib/models";

export const metadata = { title: "Zgłoszenie" };

type Props = { params: Promise<{ id: string }> };

/* eslint-disable @typescript-eslint/no-explicit-any */
type Lead = Record<string, any>;

const detailLabels: Record<string, string> = {
  product: "Produkt",
  format: "Format",
  quantity: "Nakład",
  material: "Materiał",
  finish: "Wykończenie",
  deadline: "Termin",
  filesUrl: "Pliki",
  process: "Proces",
  tools: "Narzędzia",
  volume: "Skala",
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  if (children === undefined || children === null || children === "") return null;
  return (
    <div className="grid gap-1 border-b border-line py-3 sm:grid-cols-[170px_1fr] sm:gap-4">
      <dt className="text-sm text-ink-3">{label}</dt>
      <dd className="whitespace-pre-line break-words text-[0.95rem]">{children}</dd>
    </div>
  );
}

export default async function LeadPage({ params }: Props) {
  const { id } = await params;
  if (!/^[a-f0-9]{24}$/i.test(id)) notFound();
  if (!(await connectDb())) return <DbMissing />;
  const l = (await LeadModel.findById(id).lean()) as Lead | null;
  if (!l) notFound();

  const label = (arr: readonly { value: string; label: string }[], v?: string) => (v ? arr.find((o) => o.value === v)?.label ?? v : undefined);
  const toDateInput = (d?: Date | null) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const notes = ((l.notes ?? []) as { _id: { toString(): string }; text: string; at: Date }[]).slice().reverse();
  const history = ((l.history ?? []) as { at: Date; field: string; from: string; to: string }[]).slice().reverse();

  return (
    <>
      <Link href="/admin/zgloszenia" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" /> Wszystkie zgłoszenia
      </Link>

      <div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <p className="text-sm text-ink-3">{l.number}, {dateTime(l.createdAt)}</p>
          <h1 className="mt-1 text-[clamp(1.6rem,1.2rem+1.4vw,2.3rem)] font-extrabold tracking-[-0.04em]">{l.contact?.name}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <StatusBadge status={l.status} />
            <span className="tag">{formTypeLabels[l.formType] ?? l.formType}</span>
            {l.consents?.marketing && <span className="tag">Zgoda marketingowa</span>}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${l.contact?.email}?subject=${encodeURIComponent(`Zgłoszenie ${l.number}`)}`} className="btn btn-primary btn-sm">
            <Mail size={16} aria-hidden="true" /> Odpowiedz
          </a>
          {l.contact?.phone && (
            <a href={`tel:${String(l.contact.phone).replace(/\s/g, "")}`} className="btn btn-outline btn-sm">
              <Phone size={16} aria-hidden="true" /> Zadzwoń
            </a>
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
        <div className="grid gap-4">
          <section className="adm-card">
            <h2 className="adm-h">Dane zgłoszenia</h2>
            <dl className="mt-3">
              <Row label="E-mail"><a href={`mailto:${l.contact?.email}`} className="link-u">{l.contact?.email}</a></Row>
              <Row label="Telefon">{l.contact?.phone}</Row>
              <Row label="Preferowany kontakt">{l.contact?.preferred === "telefon" ? "Telefon" : l.contact?.preferred === "email" ? "E-mail" : undefined}</Row>
              <Row label="Firma">{l.company?.name}</Row>
              <Row label="Branża">{l.company?.industry}</Row>
              <Row label="Strona">
                {l.company?.website && (
                  <a href={/^https?:/.test(l.company.website) ? l.company.website : `https://${l.company.website}`} target="_blank" rel="noopener noreferrer nofollow" className="link-u">
                    {l.company.website}
                  </a>
                )}
              </Row>
              <Row label="Wielkość firmy">{label(sizeOptions, l.company?.size)}</Row>
              <Row label="Obszary">{(l.needs ?? []).map((n: string) => label(needOptions, n)).join(", ")}</Row>
              <Row label="Usługa">{l.service}</Row>
              <Row label="Pakiet">{l.packageSlug}</Row>
              <Row label="Cel / wiadomość">{l.goals}</Row>
              <Row label="Start">{label(timelineOptions, l.timeline)}</Row>
              <Row label="Budżet">{label(budgetOptions, l.budget)}</Row>
              {l.details &&
                Object.entries(l.details as Record<string, string>).map(([k, v]) => (
                  <Row key={k} label={detailLabels[k] ?? k}>
                    {k === "filesUrl" && /^https?:\/\//.test(v) ? (
                      <a href={v} target="_blank" rel="noopener noreferrer nofollow" className="link-u">{v}</a>
                    ) : (
                      v
                    )}
                  </Row>
                ))}
              <Row label="Strona wysłania">{l.source?.page}</Row>
              <Row label="Skąd przyszedł">{l.source?.referrer}</Row>
              <Row label="Powiadomienie e-mail">{l.notified ? "Wysłane" : "Niewysłane (brak konfiguracji Resend albo błąd)"}</Row>
            </dl>
          </section>

          <section className="adm-card">
            <h2 className="adm-h">Notatki wewnętrzne</h2>
            <p className="t-small t-faint mt-1">Widoczne tylko w panelu. Klient ich nie widzi.</p>
            <div className="mt-4">
              <ActionForm action={addLeadNote} resetOnSuccess>
                <input type="hidden" name="id" value={id} />
                <label className="sr-only" htmlFor="note">Nowa notatka</label>
                <textarea id="note" name="text" className="adm-input" placeholder="Np. rozmowa telefoniczna, ustalenia, kolejny krok…" maxLength={2000} required />
                <div><SubmitButton>Dodaj notatkę</SubmitButton></div>
              </ActionForm>
            </div>
            {notes.length > 0 && (
              <ul className="mt-2 grid gap-2">
                {notes.map((n) => (
                  <li key={n._id.toString()} className="rounded-xl border border-line bg-bg-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-xs text-ink-3">{dateTime(n.at)}</span>
                      <form action={deleteLeadNote}>
                        <input type="hidden" name="id" value={id} />
                        <input type="hidden" name="noteId" value={n._id.toString()} />
                        <ConfirmButton message="Usunąć tę notatkę?" className="text-xs text-ink-3 hover:text-danger">Usuń</ConfirmButton>
                      </form>
                    </div>
                    <p className="mt-1.5 whitespace-pre-line text-[0.95rem]">{n.text}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="grid content-start gap-4">
          <section className="adm-card">
            <h2 className="adm-h">Etap sprzedaży</h2>
            <div className="mt-4">
              <StatusSelect id={id} status={l.status} action={setLeadStatus} />
            </div>
            {l.wonAt && <p className="t-small mt-3 text-success">Wygrane: {dateTime(l.wonAt)}</p>}
          </section>

          <section className="adm-card">
            <h2 className="adm-h">Szczegóły szansy</h2>
            <div className="mt-4">
              <ActionForm action={updateLead}>
                <input type="hidden" name="id" value={id} />
                <div>
                  <label className="adm-label" htmlFor="dealValue">Wartość netto (zł)</label>
                  <input id="dealValue" name="dealValue" inputMode="decimal" defaultValue={l.dealValue ?? ""} placeholder="np. 4990" className="adm-input" />
                  <p className="mt-1 text-xs text-ink-3">Kwota uzgodniona z klientem. Liczy się do statystyk sprzedaży po oznaczeniu jako „Wygrany”.</p>
                </div>
                <div>
                  <label className="adm-label" htmlFor="nextContactAt">Następny kontakt</label>
                  <input id="nextContactAt" name="nextContactAt" type="date" defaultValue={toDateInput(l.nextContactAt)} className="adm-input" />
                </div>
                <div>
                  <label className="adm-label" htmlFor="assignee">Osoba odpowiedzialna</label>
                  <input id="assignee" name="assignee" defaultValue={l.assignee ?? ""} placeholder="np. Kacper" className="adm-input" maxLength={80} />
                </div>
                <div><SubmitButton>Zapisz</SubmitButton></div>
              </ActionForm>
            </div>
          </section>

          <section className="adm-card">
            <h2 className="adm-h">Historia</h2>
            <ol className="mt-4 grid gap-3 border-l border-line pl-4">
              {history.map((h, i) => (
                <li key={i} className="relative text-sm">
                  <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-accent" aria-hidden="true" />
                  <span className="text-ink-2">{statusLabel(h.from)} → <strong className="text-ink">{statusLabel(h.to)}</strong></span>
                  <span className="block text-xs text-ink-3">{dateTime(h.at)}</span>
                </li>
              ))}
              <li className="relative text-sm">
                <span className="absolute -left-[21px] top-1.5 size-2.5 rounded-full bg-line-strong" aria-hidden="true" />
                Zgłoszenie z formularza
                <span className="block text-xs text-ink-3">{dateTime(l.createdAt)}</span>
              </li>
            </ol>
          </section>

          <section className="adm-card border-[color-mix(in_srgb,var(--danger)_35%,var(--line))]">
            <h2 className="adm-h text-danger">Usuń zgłoszenie</h2>
            <p className="t-small t-muted mt-1">Np. na prośbę klienta o usunięcie danych. Tej operacji nie można cofnąć.</p>
            <form action={deleteLead} className="mt-4 grid gap-3">
              <input type="hidden" name="id" value={id} />
              <label className="adm-label" htmlFor="confirm">Wpisz USUŃ, żeby potwierdzić</label>
              <input id="confirm" name="confirm" className="adm-input" autoComplete="off" pattern="USUŃ" required />
              <div>
                <button type="submit" className="btn btn-sm border-danger text-danger before:bg-danger hover:text-white">
                  <Trash2 size={15} aria-hidden="true" /> Usuń na stałe
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </>
  );
}
