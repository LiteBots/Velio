import type { Metadata } from "next";
import { CookieSettings } from "@/components/layout/cookie-settings";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

export const metadata: Metadata = {
  title: "Ustawienia cookies",
  alternates: { canonical: "/cookies" },
};

export default function CookiesPage() {
  return (
    <section className="container-v pb-24 pt-10 md:pt-14">
      <Breadcrumbs items={[{ name: "Ustawienia cookies", href: "/cookies" }]} />
      <h1 className="t-h1 mt-8">Ustawienia cookies</h1>
      <p className="t-lead mt-6">
        Wybierz, na co się zgadzasz. Zmianę możesz wprowadzić w każdej chwili — wystarczy wrócić na tę stronę (link jest w stopce).
      </p>
      <div className="mt-10 max-w-3xl">
        <CookieSettings />
      </div>
    </section>
  );
}
