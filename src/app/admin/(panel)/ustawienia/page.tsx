import { CircleAlert, CircleCheck } from "lucide-react";
import { seedCatalog } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/forms";
import { PageTitle } from "@/components/admin/ui";
import { siteConfig } from "@/lib/config";
import { connectDb, isDbConfigured } from "@/lib/db/mongoose";
import { FaqModel, LeadModel, PackageModel, PlanModel, PostModel, ServiceModel, UserModel } from "@/lib/models";

export const metadata = { title: "Ustawienia" };

function StatusRow({ ok, label, text }: { ok: boolean; label: string; text: string }) {
  const Icon = ok ? CircleCheck : CircleAlert;
  return (
    <li className="flex gap-3 border-b border-line py-3.5 last:border-b-0">
      <Icon size={20} className={`mt-0.5 shrink-0 ${ok ? "text-success" : "text-[#e6c34a]"}`} aria-hidden="true" />
      <div>
        <p className="font-semibold">{label}</p>
        <p className="t-small t-muted">{text}</p>
      </div>
    </li>
  );
}

export default async function SettingsPage() {
  let dbOk = false;
  let counts: Record<string, number> = {};
  try {
    if (await connectDb()) {
      dbOk = true;
      const [services, packages, plans, faqs, posts, leads, users] = await Promise.all([
        ServiceModel.countDocuments({}),
        PackageModel.countDocuments({}),
        PlanModel.countDocuments({}),
        FaqModel.countDocuments({}),
        PostModel.countDocuments({}),
        LeadModel.countDocuments({}),
        UserModel.countDocuments({}),
      ]);
      counts = { services, packages, plans, faqs, posts, leads, users };
    }
  } catch {
    dbOk = false;
  }

  const resend = Boolean(process.env.RESEND_API_KEY && process.env.LEADS_NOTIFY_EMAIL && process.env.LEADS_FROM_EMAIL);
  const secret = Boolean(process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 16);
  const pinLen = process.env.ADMIN_PIN?.trim().length ?? 0;
  const company = siteConfig.company.legalName || siteConfig.contact.email;

  return (
    <>
      <PageTitle title="Ustawienia i stan systemu" text="Konfiguracja pochodzi ze zmiennych środowiskowych w Railway → Variables. Po zmianie zmiennej Railway zrobi redeploy." />
      <div className="grid gap-4 xl:grid-cols-2">
        <section className="adm-card">
          <h2 className="adm-h">Konfiguracja</h2>
          <ul className="mt-3">
            <StatusRow ok={dbOk} label="Baza danych MongoDB" text={dbOk ? "Połączono." : isDbConfigured() ? "Nie udało się połączyć — sprawdź MONGODB_URI i stan usługi MongoDB." : "Brak MONGODB_URI."} />
            <StatusRow ok={pinLen >= 4} label="Kod dostępu do panelu" text={`ADMIN_PIN: ${pinLen} cyfr.${pinLen === 4 ? " Dłuższy kod (6–8 cyfr) jest bezpieczniejszy." : ""}`} />
            <StatusRow ok={secret} label="Klucz sesji" text={secret ? "ADMIN_SESSION_SECRET ustawiony." : "Brak ADMIN_SESSION_SECRET — sesje wygasają po każdym restarcie serwera. Ustaw losowe 32+ znaki."} />
            <StatusRow ok={resend} label="Powiadomienia e-mail o zgłoszeniach" text={resend ? "Resend skonfigurowany." : "Ustaw RESEND_API_KEY, LEADS_NOTIFY_EMAIL i LEADS_FROM_EMAIL, żeby dostawać e-mail o każdym zgłoszeniu."} />
            <StatusRow ok={!siteConfig.url.includes("localhost")} label="Adres strony" text={`NEXT_PUBLIC_SITE_URL: ${siteConfig.url}`} />
            <StatusRow ok={Boolean(company)} label="Dane firmy i kontakt" text={company ? "Uzupełnione." : "Uzupełnij NEXT_PUBLIC_COMPANY_* i NEXT_PUBLIC_CONTACT_* — pojawią się w stopce i na stronie kontaktu."} />
          </ul>
        </section>

        <section className="adm-card">
          <h2 className="adm-h">Dane w bazie</h2>
          {dbOk ? (
            <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                ["Usługi", counts.services],
                ["Pakiety", counts.packages],
                ["Abonamenty", counts.plans],
                ["FAQ", counts.faqs],
                ["Wpisy bloga", counts.posts],
                ["Zgłoszenia", counts.leads],
                ["Konta", counts.users],
              ].map(([k, v]) => (
                <div key={k as string} className="rounded-xl border border-line bg-bg-2 p-3">
                  <dt className="text-xs text-ink-3">{k}</dt>
                  <dd className="mt-1 text-xl font-bold tabular-nums">{v}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="t-small t-faint mt-3">Brak połączenia z bazą.</p>
          )}
          <div className="mt-6 border-t border-line pt-5">
            <p className="font-semibold">Oferta startowa</p>
            <p className="t-small t-muted mt-1">
              Dodaje do bazy brakujące usługi, pakiety, abonamenty i pytania FAQ z danych startowych. Niczego nie nadpisuje — Twoje zmiany zostają.
            </p>
            <form action={seedCatalog} className="mt-4">
              <SubmitButton pendingText="Wgrywanie…" className="btn btn-outline btn-sm">Wgraj brakujące elementy</SubmitButton>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}
