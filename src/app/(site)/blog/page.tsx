import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/ui/blocks";
import { blogCategories, getPosts } from "@/lib/catalog/repository";

export const metadata: Metadata = {
  title: "Blog i poradniki",
  description: "Poradniki VELIO o stronach, SEO, reklamach, automatyzacjach i budowaniu marki.",
  alternates: { canonical: "/blog" },
};

type Props = { searchParams: Promise<{ kategoria?: string }> };

const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export default async function BlogPage({ searchParams }: Props) {
  const { kategoria } = await searchParams;
  const posts = await getPosts();
  const active = blogCategories.find((c) => c.slug === kategoria);
  const visible = active ? posts.filter((p) => p.category === active.slug) : posts;

  return (
    <>
      <PageHero crumbs={[{ name: "Blog", href: "/blog" }]} title="Blog i poradniki" lead="Praktyczne materiały o pozyskiwaniu klientów: od strony internetowej po automatyzacje." />
      <section className="container-v pb-24">
        <nav aria-label="Kategorie" className="flex flex-wrap gap-2 border-b border-line pb-6">
          <Link href="/blog" className={`btn btn-sm ${!active ? "btn-ink" : "btn-outline"}`} aria-current={!active ? "page" : undefined}>
            Wszystkie
          </Link>
          {blogCategories.map((c) => (
            <Link
              key={c.slug}
              href={`/blog?kategoria=${c.slug}`}
              className={`btn btn-sm ${active?.slug === c.slug ? "btn-ink" : "btn-outline"}`}
              aria-current={active?.slug === c.slug ? "page" : undefined}
            >
              {c.name}
            </Link>
          ))}
        </nav>

        {visible.length === 0 ? (
          <div className="py-20 text-center">
            <h2 className="t-h3">Pierwsze poradniki są w przygotowaniu.</h2>
            <p className="t-muted mx-auto mt-3 max-w-md">
              Nie publikujemy treści na siłę. Jeśli chcesz, żebyśmy opisali konkretny temat, napisz do nas.
            </p>
            <Link href="/kontakt" className="btn btn-outline mt-7">Zaproponuj temat</Link>
          </div>
        ) : (
          <ul className="grid gap-x-10 md:grid-cols-2">
            {visible.map((p) => (
              <li key={p.slug} className="border-b border-line">
                <Link href={`/blog/${p.slug}`} className="group block py-8">
                  <p className="t-small t-faint">
                    {blogCategories.find((c) => c.slug === p.category)?.name ?? "Poradnik"}
                    {p.publishedAt && <>, {dateFmt.format(new Date(p.publishedAt))}</>}
                  </p>
                  <h2 className="mt-2 text-xl font-bold leading-snug tracking-tight group-hover:text-accent-text">{p.title}</h2>
                  {p.excerpt && <p className="t-muted mt-2">{p.excerpt}</p>}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
