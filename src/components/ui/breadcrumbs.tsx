import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteConfig } from "@/lib/config";

export type Crumb = { name: string; href: string };

/** Breadcrumbs z danymi strukturalnymi BreadcrumbList (zgodnymi z widoczną treścią). */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all = [{ name: "Strona główna", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: `${siteConfig.url}${c.href === "/" ? "" : c.href}`,
    })),
  };
  return (
    <nav aria-label="Ścieżka nawigacji" className="t-small text-ink-3">
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={c.href} className="flex items-center gap-1.5">
              {last ? (
                <span aria-current="page" className="text-ink-2">{c.name}</span>
              ) : (
                <>
                  <Link href={c.href} className="hover:text-ink">{c.name}</Link>
                  <ChevronRight size={14} aria-hidden="true" />
                </>
              )}
            </li>
          );
        })}
      </ol>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </nav>
  );
}
