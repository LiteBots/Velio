import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/layout/legal-page";
import { siteConfig } from "@/lib/config";

export const metadata: Metadata = {
  title: "Polityka prywatności",
  alternates: { canonical: "/polityka-prywatnosci" },
};

export default function PrivacyPage() {
  const { company, contact } = siteConfig;
  return (
    <LegalPage title="Polityka prywatności" href="/polityka-prywatnosci">
      <h2>Administrator danych</h2>
      <p>
        Administratorem danych osobowych jest {company.legalName ?? "[nazwa firmy — uzupełnij]"}
        {company.address ? `, ${company.address}` : ", [adres — uzupełnij]"}
        {company.nip ? `, NIP ${company.nip}` : ""}. Kontakt w sprawie danych: {contact.email ?? "[adres e-mail — uzupełnij]"}.
      </p>

      <h2 id="przetwarzanie-danych">Jakie dane przetwarzamy i w jakim celu</h2>
      <ul>
        <li>Dane z formularzy (imię i nazwisko, e-mail, telefon, dane firmy, treść zapytania) — w celu odpowiedzi na zapytanie i przygotowania wyceny.</li>
        <li>Zgoda marketingowa (jeśli zaznaczona) — w celu wysyłania informacji o usługach i poradnikach.</li>
        <li>Skrót adresu IP — w celu ochrony formularzy przed nadużyciami. Nie przechowujemy pełnego adresu IP przy zgłoszeniu.</li>
      </ul>

      <h2>Podstawa prawna</h2>
      <p>[Uzupełnij podstawy prawne przetwarzania dla każdego celu — do weryfikacji z prawnikiem.]</p>

      <h2>Okres przechowywania</h2>
      <p>[Uzupełnij okres przechowywania zapytań, które nie zakończyły się współpracą, oraz danych klientów.]</p>

      <h2>Odbiorcy danych</h2>
      <p>[Uzupełnij: dostawca hostingu i bazy danych, dostawca poczty e-mail i inne podmioty przetwarzające.]</p>

      <h2>Twoje prawa</h2>
      <p>
        Masz prawo dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania, przenoszenia, wniesienia sprzeciwu oraz cofnięcia zgody w dowolnym momencie. Masz też prawo wnieść skargę do Prezesa UODO.
      </p>

      <h2>Cookies</h2>
      <p>
        Informacje o plikach cookies i zarządzanie zgodami znajdziesz w <Link href="/cookies">ustawieniach cookies</Link>.
      </p>
    </LegalPage>
  );
}
