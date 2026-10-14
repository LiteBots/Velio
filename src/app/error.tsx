"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container-v grid min-h-[60vh] content-center py-24">
      <p className="t-small t-faint font-semibold">Błąd strony</p>
      <h1 className="t-h1 mt-4 max-w-[16ch]">Nie udało się wczytać tej strony.</h1>
      <p className="t-lead mt-6">
        Spróbuj ponownie. Jeśli błąd się powtarza, napisz do nas{error.digest ? ` i podaj kod ${error.digest}` : ""}.
      </p>
      <div className="mt-9 flex flex-wrap gap-2">
        <button type="button" onClick={reset} className="btn btn-ink">Spróbuj ponownie</button>
        <Link href="/" className="btn btn-outline">Strona główna</Link>
      </div>
    </section>
  );
}
