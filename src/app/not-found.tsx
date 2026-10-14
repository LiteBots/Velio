import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-v grid min-h-[60vh] content-center py-24">
      <p className="t-small t-faint font-semibold">Błąd 404</p>
      <h1 className="t-h1 mt-4 max-w-[14ch]">Tej strony nie ma pod tym adresem.</h1>
      <p className="t-lead mt-6">Mogła zostać przeniesiona albo w adresie jest literówka.</p>
      <div className="mt-9 flex flex-wrap gap-2">
        <Link href="/" className="btn btn-ink">Strona główna</Link>
        <Link href="/uslugi" className="btn btn-outline">Usługi</Link>
        <Link href="/kontakt" className="btn btn-ghost">Kontakt</Link>
      </div>
    </section>
  );
}
