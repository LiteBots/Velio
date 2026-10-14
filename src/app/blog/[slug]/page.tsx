import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CtaBand } from "@/components/ui/blocks";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { blogCategories, getPost } from "@/lib/catalog/repository";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Nie znaleziono wpisu" };
  return {
    title: post.seo?.title ?? post.title,
    description: post.seo?.description ?? post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.excerpt, publishedTime: post.publishedAt },
  };
}

const dateFmt = new Intl.DateTimeFormat("pl-PL", { day: "numeric", month: "long", year: "numeric" });

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const category = blogCategories.find((c) => c.slug === post.category);
  // Treść wpisu: akapity rozdzielone pustą linią, nagłówki zaczynające się od „## ”.
  const blocks = (post.body ?? "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);

  return (
    <>
      <article className="container-v pb-20 pt-10 md:pt-14">
        <Breadcrumbs items={[{ name: "Blog", href: "/blog" }, { name: post.title, href: `/blog/${post.slug}` }]} />
        <header className="mt-8 max-w-3xl">
          <p className="t-small t-faint">
            {category?.name ?? "Poradnik"}
            {post.publishedAt && <>, <time dateTime={post.publishedAt}>{dateFmt.format(new Date(post.publishedAt))}</time></>}
          </p>
          <h1 className="t-h1 mt-4">{post.title}</h1>
          {post.excerpt && <p className="t-lead mt-6">{post.excerpt}</p>}
        </header>
        <div className="prose-v mt-12">
          {blocks.map((b, i) =>
            b.startsWith("## ") ? <h2 key={i}>{b.slice(3)}</h2> : b.startsWith("### ") ? <h3 key={i}>{b.slice(4)}</h3> : <p key={i}>{b}</p>,
          )}
        </div>
      </article>
      <CtaBand />
    </>
  );
}
