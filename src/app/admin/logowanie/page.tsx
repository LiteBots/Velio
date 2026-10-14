import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { VelioMark } from "@/components/brand/logo";
import { PinForm } from "@/components/admin/pin-form";
import { isAdmin, isAdminConfigured } from "@/lib/admin/auth";

export const metadata: Metadata = { title: "Logowanie" };

export default async function AdminLoginPage() {
  if (await isAdmin()) redirect("/admin");
  const configured = isAdminConfigured();
  const length = configured ? process.env.ADMIN_PIN!.trim().length : 4;

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-4 py-16">
      <div className="hero-orb o1" aria-hidden="true" />
      <div className="hero-orb o2" aria-hidden="true" />
      <div className="enter relative w-full max-w-md text-center">
        <span className="inline-grid size-16 place-items-center rounded-2xl border border-line bg-surface text-ink shadow-[0_0_40px_var(--accent-glow)]">
          <VelioMark size={30} />
        </span>
        <h1 className="mt-8 text-3xl font-extrabold tracking-[-0.04em]">Panel właściciela</h1>
        {configured ? (
          <>
            <p className="t-muted mt-3">Wpisz kod dostępu, żeby przejść do panelu.</p>
            <div className="mt-10">
              <PinForm length={length} />
            </div>
          </>
        ) : (
          <p className="t-muted mt-4 rounded-[var(--radius)] border border-line bg-surface p-5 text-left text-sm">
            Panel jest wyłączony. Dodaj w Railway → usługa aplikacji → <strong>Variables</strong> zmienną{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">ADMIN_PIN</code> z kodem (4–12 cyfr) oraz{" "}
            <code className="rounded bg-surface-2 px-1.5 py-0.5">ADMIN_SESSION_SECRET</code> (min. 32 losowe znaki), a potem zrób redeploy.
          </p>
        )}
        <p className="t-small t-faint mt-10">
          Po 5 błędnych próbach logowanie z tego urządzenia blokuje się na 15 minut.
        </p>
      </div>
    </main>
  );
}
