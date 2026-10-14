import type { CSSProperties } from "react";
import Link from "next/link";
import { Pencil } from "lucide-react";
import { seedCatalog } from "@/app/admin/actions";
import { SubmitButton } from "@/components/admin/forms";
import { DbMissing, Empty, PageTitle } from "@/components/admin/ui";
import { pln } from "@/lib/admin/labels";
import { billingLabels, type BillingType } from "@/lib/catalog/types";
import { connectDb } from "@/lib/db/mongoose";
import { PackageModel, PlanModel, ServiceModel } from "@/lib/models";

export const metadata = { title: "Oferta i ceny" };

const tabs = [
  { key: "uslugi", label: "Usługi" },
  { key: "pakiety", label: "Pakiety" },
  { key: "abonamenty", label: "Abonamenty" },
] as const;

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function OfferPage({ searchParams }: { searchParams: Promise<{ typ?: string }> }) {
  const { typ = "uslugi" } = await searchParams;
  const tab = tabs.find((t) => t.key === typ)?.key ?? "uslugi";
  if (!(await connectDb())) return <DbMissing />;

  const Model = tab === "pakiety" ? PackageModel : tab === "abonamenty" ? PlanModel : ServiceModel;
  const items = (await Model.find({}).sort({ order: 1 }).lean()) as any[];

  const priceOf = (it: any) => {
    if (tab === "uslugi") return it.pricing?.kind === "from" ? `od ${pln(it.pricing.amount)}` : "Wycena indywidualna";
    return typeof it.priceFrom === "number" ? `od ${pln(it.priceFrom)}` : "Wycena indywidualna";
  };

  return (
    <>
      <PageTitle
        title="Oferta i ceny"
        text="Ceny, opisy i widoczność na stronie. Zmiany zapisują się w bazie i od razu pojawiają się na stronie publicznej."
      />
      <nav aria-label="Rodzaj oferty" className="adm-tabs mb-5">
        {tabs.map((t) => (
          <Link key={t.key} href={`/admin/oferta?typ=${t.key}`} aria-current={tab === t.key ? "page" : undefined}>
            {t.label}
          </Link>
        ))}
      </nav>

      {items.length === 0 ? (
        <Empty
          title="Oferta nie jest jeszcze zapisana w bazie"
          text="Strona pokazuje teraz dane startowe z pliku. Wgraj je do bazy, żeby móc edytować ceny i opisy z panelu."
          action={
            <form action={seedCatalog}>
              <SubmitButton pendingText="Wgrywanie…">Wgraj ofertę startową</SubmitButton>
            </form>
          }
        />
      ) : (
        <div className="adm-card overflow-hidden p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Kolejność</th>
                  <th>Nazwa</th>
                  <th>Cena</th>
                  {tab === "abonamenty" && <th>Rozliczenie</th>}
                  <th>Na stronie</th>
                  <th><span className="sr-only">Akcje</span></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.slug}>
                    <td className="w-20 text-ink-3">{it.order}</td>
                    <td>
                      <span className="font-semibold">{it.name}</span>
                      {it.featured && <span className="tag tag-accent ml-2">Wyróżniony</span>}
                      <span className="block text-xs text-ink-3">/{it.slug}</span>
                    </td>
                    <td className="whitespace-nowrap">{priceOf(it)}</td>
                    {tab === "abonamenty" && (
                      <td className="text-xs text-ink-2">{(it.billing ?? []).map((b: BillingType) => billingLabels[b] ?? b).join(", ")}</td>
                    )}
                    <td>
                      {it.published ? <span className="adm-badge" style={{ "--tone": "#2fbf71" } as CSSProperties}>Widoczne</span> : <span className="adm-badge" style={{ "--tone": "#7a7f8c" } as CSSProperties}>Ukryte</span>}
                    </td>
                    <td className="text-right">
                      <Link href={`/admin/oferta/${tab}/${it.slug}`} className="btn btn-outline btn-sm">
                        <Pencil size={14} aria-hidden="true" /> Edytuj
                      </Link>
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
