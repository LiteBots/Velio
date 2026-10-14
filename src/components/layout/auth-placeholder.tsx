import Link from "next/link";
import { VelioMark } from "@/components/brand/logo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";

/**
 * Ekran logowania/rejestracji do czasu uruchomienia panelu klienta (etap 2).
 * Nie pokazuje formularza logowania, który by nie działał.
 */
export function AuthPlaceholder({ title, crumb, href }: { title: string; crumb: string; href: string }) {
  return (
    <section className="container-v pb-24 pt-10 md:pt-14">
      <Breadcrumbs items={[{ name: crumb, href }]} />
      <div className="mx-auto mt-12 max-w-xl rounded-[var(--radius-lg)] border border-line bg-surface p-8 md:p-12">
        <VelioMark size={40} />
        <h1 className="t-h2 mt-8">{title}</h1>
        <p className="t-muted mt-4">
          Panel klienta — z projektami, wycenami, plikami i raportami w jednym miejscu — uruchamiamy w kolejnym etapie. Do tego czasu zgłoszenia przyjmujemy przez formularz, a odpowiadamy e-mailem.
        </p>
        <div className="mt-8 flex flex-wrap gap-2">
          <Link href="/wycena" className="btn btn-primary">Wyceń projekt bez zakładania konta</Link>
          <Link href="/kontakt" className="btn btn-outline">Napisz do nas</Link>
        </div>
      </div>
    </section>
  );
}
