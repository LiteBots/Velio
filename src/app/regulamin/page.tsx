import type { Metadata } from "next";
import { LegalPage } from "@/components/layout/legal-page";

export const metadata: Metadata = {
  title: "Regulamin",
  alternates: { canonical: "/regulamin" },
};

export default function TermsPage() {
  return (
    <LegalPage title="Regulamin" href="/regulamin">
      <h2>1. Postanowienia ogólne</h2>
      <p>[Uzupełnij: usługodawca, zakres regulaminu, definicje.]</p>
      <h2>2. Formularze i zapytania</h2>
      <p>
        Wysłanie formularza wyceny lub kontaktu nie stanowi zamówienia ani zawarcia umowy. Zakres, cena i termin są potwierdzane osobno, po przedstawieniu wyceny.
      </p>
      <h2>3. Ceny</h2>
      <p>Ceny na stronie są cenami netto i mają charakter orientacyjny („od”). Ostateczna cena jest określana w wycenie. Budżet reklamowy i licencje narzędzi zewnętrznych nie są częścią wynagrodzenia, chyba że wycena stanowi inaczej.</p>
      <h2>4. Konto klienta</h2>
      <p>[Uzupełnij po uruchomieniu panelu klienta: zakładanie konta, bezpieczeństwo, usuwanie konta.]</p>
      <h2>5. Płatności</h2>
      <p>[Uzupełnij po wyborze operatora płatności.]</p>
      <h2>6. Reklamacje</h2>
      <p>[Uzupełnij tryb i terminy rozpatrywania reklamacji.]</p>
      <h2>7. Postanowienia końcowe</h2>
      <p>[Uzupełnij.]</p>
    </LegalPage>
  );
}
