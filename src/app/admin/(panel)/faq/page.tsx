import { deleteFaq, saveFaq } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { DbMissing, PageTitle } from "@/components/admin/ui";
import { connectDb } from "@/lib/db/mongoose";
import { FaqModel } from "@/lib/models";

export const metadata = { title: "FAQ" };

/* eslint-disable @typescript-eslint/no-explicit-any */
function FaqFields({ f }: { f?: any }) {
  const id = f ? String(f._id) : "new";
  return (
    <>
      {f && <input type="hidden" name="id" value={id} />}
      <div className="grid gap-3 md:grid-cols-[1fr_200px_100px]">
        <div>
          <label className="adm-label" htmlFor={`q-${id}`}>Pytanie</label>
          <input id={`q-${id}`} name="q" defaultValue={f?.q} className="adm-input" required />
        </div>
        <div>
          <label className="adm-label" htmlFor={`c-${id}`}>Kategoria</label>
          <input id={`c-${id}`} name="category" defaultValue={f?.category ?? "Współpraca"} className="adm-input" list="faq-cats" />
        </div>
        <div>
          <label className="adm-label" htmlFor={`o-${id}`}>Kolejność</label>
          <input id={`o-${id}`} name="order" type="number" defaultValue={f?.order ?? 0} className="adm-input" />
        </div>
      </div>
      <div>
        <label className="adm-label" htmlFor={`a-${id}`}>Odpowiedź</label>
        <textarea id={`a-${id}`} name="a" defaultValue={f?.a} rows={3} className="adm-input" required />
      </div>
      <label className="checkline">
        <input type="checkbox" name="published" defaultChecked={f ? f.published : true} /> <span className="text-ink">Widoczne na stronie</span>
      </label>
    </>
  );
}

export default async function FaqAdminPage() {
  if (!(await connectDb())) return <DbMissing />;
  const faqs = (await FaqModel.find({}).sort({ order: 1, createdAt: 1 }).lean()) as any[];
  const cats = Array.from(new Set(faqs.map((f) => f.category).filter(Boolean)));

  return (
    <>
      <PageTitle title="FAQ" text="Pytania i odpowiedzi wyświetlane na stronie głównej i w zakładce FAQ." />
      <datalist id="faq-cats">
        {cats.map((c) => <option key={c} value={c} />)}
      </datalist>

      <section className="adm-card mb-6 max-w-4xl">
        <h2 className="adm-h mb-4">Nowe pytanie</h2>
        <ActionForm action={saveFaq} resetOnSuccess>
          <FaqFields />
          <div><SubmitButton>Dodaj pytanie</SubmitButton></div>
        </ActionForm>
      </section>

      <div className="grid max-w-4xl gap-3">
        {faqs.length === 0 && <p className="t-small t-faint">Brak pytań w bazie. Możesz wgrać pytania startowe w Ustawieniach.</p>}
        {faqs.map((f) => (
          <details key={String(f._id)} className="adm-card">
            <summary className="flex cursor-pointer items-center justify-between gap-4 font-semibold">
              <span>
                {f.q}
                {!f.published && <span className="tag ml-2">Ukryte</span>}
              </span>
              <span className="text-xs font-normal text-ink-3">{f.category}</span>
            </summary>
            <div className="mt-4">
              <ActionForm action={saveFaq}>
                <FaqFields f={f} />
                <div className="flex items-center gap-2">
                  <SubmitButton>Zapisz</SubmitButton>
                </div>
              </ActionForm>
              <form action={deleteFaq} className="mt-1">
                <input type="hidden" name="id" value={String(f._id)} />
                <ConfirmButton message="Usunąć to pytanie?">Usuń pytanie</ConfirmButton>
              </form>
            </div>
          </details>
        ))}
      </div>
    </>
  );
}
