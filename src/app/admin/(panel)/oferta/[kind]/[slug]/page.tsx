import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { updatePackage, updatePlan, updateService } from "@/app/admin/actions";
import { ActionForm, SubmitButton } from "@/components/admin/forms";
import { DbMissing, PageTitle } from "@/components/admin/ui";
import { billingLabels, type BillingType } from "@/lib/catalog/types";
import { connectDb } from "@/lib/db/mongoose";
import { PackageModel, PlanModel, ServiceModel } from "@/lib/models";

export const metadata = { title: "Edycja oferty" };

type Props = { params: Promise<{ kind: string; slug: string }> };

/* eslint-disable @typescript-eslint/no-explicit-any */

function Field({ label, name, defaultValue, hint, textarea, rows, type = "text", inputMode }: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  hint?: string;
  textarea?: boolean;
  rows?: number;
  type?: string;
  inputMode?: "decimal" | "numeric";
}) {
  return (
    <div>
      <label className="adm-label" htmlFor={name}>{label}</label>
      {textarea ? (
        <textarea id={name} name={name} rows={rows ?? 4} defaultValue={defaultValue ?? ""} className="adm-input" />
      ) : (
        <input id={name} name={name} type={type} inputMode={inputMode} defaultValue={defaultValue ?? ""} className="adm-input" />
      )}
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </div>
  );
}

function Check({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="checkline">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} /> <span className="text-ink">{label}</span>
    </label>
  );
}

export default async function EditOfferPage({ params }: Props) {
  const { kind, slug } = await params;
  if (!["uslugi", "pakiety", "abonamenty"].includes(kind)) notFound();
  if (!(await connectDb())) return <DbMissing />;
  const Model = kind === "pakiety" ? PackageModel : kind === "abonamenty" ? PlanModel : ServiceModel;
  const it = (await Model.findOne({ slug }).lean()) as any;
  if (!it) notFound();

  const publicHref = kind === "uslugi" ? `/uslugi/${slug}` : kind === "pakiety" ? `/pakiety#${slug}` : `/abonamenty#${slug}`;
  const join = (a?: string[]) => (a ?? []).join("\n");

  return (
    <>
      <Link href={`/admin/oferta?typ=${kind}`} className="mb-5 inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" /> Oferta
      </Link>
      <PageTitle
        title={it.name}
        text="Listy (zakres, zawartość pakietu) wpisuj po jednej pozycji w linii. Ceny podawaj netto."
        actions={
          <a href={publicHref} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
            <ExternalLink size={15} aria-hidden="true" /> Zobacz na stronie
          </a>
        }
      />

      <div className="adm-card max-w-4xl">
        {kind === "pakiety" && (
          <ActionForm action={updatePackage}>
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nazwa" name="name" defaultValue={it.name} />
              <Field label="Dla kogo" name="audience" defaultValue={it.audience} />
              <Field label="Cena od (zł netto)" name="priceFrom" defaultValue={it.priceFrom} inputMode="decimal" hint="Puste pole = „Wycena indywidualna”." />
              <Field label="Jednostka ceny" name="priceUnit" defaultValue={it.priceUnit} hint="np. „netto za wdrożenie”" />
              <Field label="Czas realizacji" name="duration" defaultValue={it.duration} />
              <Field label="Kolejność" name="order" type="number" defaultValue={it.order} />
            </div>
            <Field label="Opis" name="description" defaultValue={it.description} textarea rows={3} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Co zawiera (jedna pozycja w linii)" name="includes" defaultValue={join(it.includes)} textarea rows={8} />
              <Field label="Ograniczenia" name="limits" defaultValue={join(it.limits)} textarea rows={8} />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Możliwe rozszerzenia" name="extensions" defaultValue={join(it.extensions)} textarea rows={4} />
              <Field label="Koszty osobne" name="separateCosts" defaultValue={it.separateCosts} textarea rows={4} hint="np. budżet reklamowy, licencje narzędzi" />
            </div>
            <div className="flex flex-wrap gap-6">
              <Check name="published" label="Widoczny na stronie" defaultChecked={it.published} />
              <Check name="featured" label="Wyróżniony („Najczęściej wybierany”)" defaultChecked={it.featured} />
            </div>
            <div><SubmitButton>Zapisz pakiet</SubmitButton></div>
          </ActionForm>
        )}

        {kind === "uslugi" && (
          <ActionForm action={updateService}>
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nazwa" name="name" defaultValue={it.name} />
              <Field label="Kolejność" name="order" type="number" defaultValue={it.order} />
            </div>
            <Field label="Krótki opis (listy, menu)" name="summary" defaultValue={it.summary} textarea rows={2} />
            <Field label="Wprowadzenie na podstronie" name="intro" defaultValue={it.intro} textarea rows={4} />
            <Field label="Zakres usługi (jedna pozycja w linii)" name="scope" defaultValue={join(it.scope)} textarea rows={8} />
            <fieldset className="grid gap-4 rounded-xl border border-line p-4 md:grid-cols-3">
              <legend className="px-1 text-sm font-semibold">Cena</legend>
              <div>
                <label className="adm-label" htmlFor="pricingKind">Sposób wyceny</label>
                <select id="pricingKind" name="pricingKind" defaultValue={it.pricing?.kind ?? "quote"} className="adm-input">
                  <option value="from">Cena „od”</option>
                  <option value="quote">Wycena indywidualna</option>
                </select>
              </div>
              <Field label="Kwota od (zł netto)" name="amount" defaultValue={it.pricing?.amount} inputMode="decimal" />
              <Field label="Jednostka" name="unit" defaultValue={it.pricing?.unit} hint="np. „netto za wdrożenie”" />
              <div className="md:col-span-3">
                <Field label="Opis ceny" name="pricingNote" defaultValue={it.pricing?.note} textarea rows={2} />
              </div>
              <div className="md:col-span-3">
                <Field label="Ważna informacja przy cenie" name="pricingNotice" defaultValue={it.pricingNotice} textarea rows={2} hint="np. o budżecie reklamowym płaconym platformom" />
              </div>
            </fieldset>
            <fieldset className="grid gap-4 rounded-xl border border-line p-4">
              <legend className="px-1 text-sm font-semibold">SEO</legend>
              <Field label="Meta title" name="seoTitle" defaultValue={it.seo?.title} />
              <Field label="Meta description" name="seoDescription" defaultValue={it.seo?.description} textarea rows={2} />
            </fieldset>
            <Check name="published" label="Widoczna na stronie" defaultChecked={it.published} />
            <div><SubmitButton>Zapisz usługę</SubmitButton></div>
          </ActionForm>
        )}

        {kind === "abonamenty" && (
          <ActionForm action={updatePlan}>
            <input type="hidden" name="slug" value={slug} />
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nazwa" name="name" defaultValue={it.name} />
              <Field label="Kolejność" name="order" type="number" defaultValue={it.order} />
              <Field label="Cena od (zł netto)" name="priceFrom" defaultValue={it.priceFrom} inputMode="decimal" hint="Puste pole = „Cena ustalana w wycenie”." />
              <Field label="Jednostka ceny" name="priceUnit" defaultValue={it.priceUnit} hint="np. „netto / mies.”" />
            </div>
            <Field label="Opis" name="summary" defaultValue={it.summary} textarea rows={2} />
            <Field label="Co obejmuje (jedna pozycja w linii)" name="features" defaultValue={join(it.features)} textarea rows={6} />
            <fieldset>
              <legend className="adm-label">Sposób rozliczenia</legend>
              <div className="flex flex-wrap gap-5">
                {(Object.keys(billingLabels) as BillingType[]).map((b) => (
                  <label key={b} className="checkline">
                    <input type="checkbox" name="billing" value={b} defaultChecked={(it.billing ?? []).includes(b)} />
                    <span className="text-ink">{billingLabels[b]}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <Check name="published" label="Widoczny na stronie" defaultChecked={it.published} />
            <div><SubmitButton>Zapisz abonament</SubmitButton></div>
          </ActionForm>
        )}
      </div>
    </>
  );
}
