import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { deletePost, savePost } from "@/app/admin/actions";
import { ActionForm, ConfirmButton, SubmitButton } from "@/components/admin/forms";
import { DbMissing, PageTitle } from "@/components/admin/ui";
import { blogCategories } from "@/lib/catalog/repository";
import { connectDb } from "@/lib/db/mongoose";
import { PostModel } from "@/lib/models";

export const metadata = { title: "Wpis na blogu" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function PostEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "nowy";
  if (!isNew && !/^[a-f0-9]{24}$/i.test(id)) notFound();
  if (!(await connectDb())) return <DbMissing />;
  const p = isNew ? null : ((await PostModel.findById(id).lean()) as any);
  if (!isNew && !p) notFound();

  return (
    <>
      <Link href="/admin/blog" className="mb-5 inline-flex items-center gap-2 text-sm text-ink-3 hover:text-ink">
        <ArrowLeft size={16} aria-hidden="true" /> Blog
      </Link>
      <PageTitle
        title={isNew ? "Nowy wpis" : p.title}
        text="Treść: akapity oddzielaj pustą linią. Linia zaczynająca się od „## ” to śródtytuł, od „### ” — mniejszy śródtytuł."
        actions={
          p?.published ? (
            <a href={`/blog/${p.slug}`} target="_blank" rel="noopener" className="btn btn-outline btn-sm">
              <ExternalLink size={15} aria-hidden="true" /> Zobacz wpis
            </a>
          ) : undefined
        }
      />
      <div className="adm-card max-w-4xl">
        <ActionForm action={savePost}>
          {!isNew && <input type="hidden" name="id" value={id} />}
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className="adm-label" htmlFor="title">Tytuł</label>
              <input id="title" name="title" defaultValue={p?.title} className="adm-input" required maxLength={160} />
            </div>
            <div>
              <label className="adm-label" htmlFor="slug">Adres (slug)</label>
              <input id="slug" name="slug" defaultValue={p?.slug} placeholder="tworzony z tytułu, jeśli pusty" className="adm-input" maxLength={80} />
            </div>
            <div>
              <label className="adm-label" htmlFor="category">Kategoria</label>
              <select id="category" name="category" defaultValue={p?.category ?? ""} className="adm-input">
                <option value="">Bez kategorii</option>
                {blogCategories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="adm-label" htmlFor="excerpt">Zajawka</label>
            <textarea id="excerpt" name="excerpt" defaultValue={p?.excerpt} rows={2} className="adm-input" maxLength={400} />
          </div>
          <div>
            <label className="adm-label" htmlFor="body">Treść</label>
            <textarea id="body" name="body" defaultValue={p?.body} rows={18} className="adm-input font-[inherit]" />
          </div>
          <fieldset className="grid gap-4 rounded-xl border border-line p-4">
            <legend className="px-1 text-sm font-semibold">SEO</legend>
            <div>
              <label className="adm-label" htmlFor="seoTitle">Meta title</label>
              <input id="seoTitle" name="seoTitle" defaultValue={p?.seo?.title} className="adm-input" maxLength={70} />
            </div>
            <div>
              <label className="adm-label" htmlFor="seoDescription">Meta description</label>
              <textarea id="seoDescription" name="seoDescription" defaultValue={p?.seo?.description} rows={2} className="adm-input" maxLength={170} />
            </div>
          </fieldset>
          <label className="checkline">
            <input type="checkbox" name="published" defaultChecked={p?.published ?? false} /> <span className="text-ink">Opublikowany</span>
          </label>
          <div><SubmitButton>{isNew ? "Utwórz wpis" : "Zapisz wpis"}</SubmitButton></div>
        </ActionForm>
        {!isNew && (
          <form action={deletePost} className="mt-2 border-t border-line pt-4">
            <input type="hidden" name="id" value={id} />
            <ConfirmButton message="Usunąć ten wpis na stałe?">Usuń wpis</ConfirmButton>
          </form>
        )}
      </div>
    </>
  );
}
