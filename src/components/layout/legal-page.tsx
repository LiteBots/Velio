import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

/** Układ stron prawnych. Treść to szablon do uzupełnienia — nie jest weryfikowaną poradą prawną. */
export function LegalPage({ title, href, children }: { title: string; href: string; children: ReactNode }) {
  return (
    <article className="container-v pb-24 pt-10 md:pt-14">
      <Breadcrumbs items={[{ name: title, href }]} />
      <h1 className="t-h1 mt-8">{title}</h1>
      <p className="t-small mt-6 max-w-2xl rounded-[var(--radius-sm)] border border-line-strong bg-surface p-4 text-ink-2">
        <strong className="text-ink">Szablon do uzupełnienia.</strong> Ten dokument przygotowano jako strukturę. Przed publikacją uzupełnij dane firmy i zweryfikuj treść z prawnikiem — nie stanowi porady prawnej.
      </p>
      <div className="prose-v mt-10">{children}</div>
    </article>
  );
}
