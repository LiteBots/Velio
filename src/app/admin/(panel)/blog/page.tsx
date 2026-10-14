import Link from "next/link";
import { Plus } from "lucide-react";
import { DbMissing, Empty, PageTitle } from "@/components/admin/ui";
import { dateOnly } from "@/lib/admin/labels";
import { blogCategories } from "@/lib/catalog/repository";
import { connectDb } from "@/lib/db/mongoose";
import { PostModel } from "@/lib/models";

export const metadata = { title: "Blog" };

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function BlogAdminPage() {
  if (!(await connectDb())) return <DbMissing />;
  const posts = (await PostModel.find({}).sort({ updatedAt: -1 }).lean()) as any[];

  return (
    <>
      <PageTitle
        title="Blog i poradniki"
        text="Wpisy pojawiają się na stronie po zaznaczeniu „Opublikowany”."
        actions={
          <Link href="/admin/blog/nowy" className="btn btn-primary btn-sm">
            <Plus size={16} aria-hidden="true" /> Nowy wpis
          </Link>
        }
      />
      {posts.length === 0 ? (
        <Empty title="Nie ma jeszcze wpisów" text="Napisz pierwszy poradnik. Strona bloga pokazuje teraz komunikat, że treści są w przygotowaniu." action={<Link href="/admin/blog/nowy" className="btn btn-outline btn-sm">Napisz wpis</Link>} />
      ) : (
        <div className="adm-card overflow-hidden p-0 md:p-0">
          <div className="overflow-x-auto">
            <table className="adm-table">
              <thead>
                <tr><th>Tytuł</th><th>Kategoria</th><th>Status</th><th>Publikacja</th></tr>
              </thead>
              <tbody>
                {posts.map((p) => (
                  <tr key={String(p._id)}>
                    <td>
                      <Link href={`/admin/blog/${String(p._id)}`} className="font-semibold hover:text-accent-text">{p.title}</Link>
                      <span className="block text-xs text-ink-3">/blog/{p.slug}</span>
                    </td>
                    <td className="text-ink-2">{blogCategories.find((c) => c.slug === p.category)?.name ?? "—"}</td>
                    <td>{p.published ? <span className="tag tag-accent">Opublikowany</span> : <span className="tag">Szkic</span>}</td>
                    <td className="text-ink-3">{dateOnly(p.publishedAt)}</td>
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
