# VELIO — platforma agencji marketingowej

Etap 1: design system, strona publiczna, katalog oferty w MongoDB i formularze zapisujące zgłoszenia.
Stack: **Next.js 15 (App Router) + TypeScript + Tailwind CSS 4 + MongoDB (Mongoose) + Zod**, hosting na **Railway**.

## Co jest w tym etapie

- **Styl „agencja kreatywna”, domyślnie ciemny** — animowane tło hero (siatka punktów reagująca na kursor, `components/motion/hero-field.tsx`), nagłówki odsłaniane linia po linii, wejścia sekcji przy przewijaniu (`data-reveal` + `RevealObserver`), przesuwający się pasek kompetencji przyspieszający przy scrollu, lista usług z podglądem za kursorem, oś procesu wypełniająca się przy przewijaniu, liczniki, rysujące się wykresy, karty 3D z poświatą, magnetyczne przyciski i własny kursor. Wszystkie animacje wyłączają się przy `prefers-reduced-motion`, a efekty kursora nie działają na dotyku.
- **Design system** — tokeny kolorów w `src/app/globals.css` (motyw jasny i ciemny, akcent `#7357FF`), typografia Schibsted Grotesk, komponenty przycisków, pól, akordeonu, skeletonów. Przełącznik motywu zapamiętuje wybór, przy pierwszej wizycie używa ustawień systemu.
- **Logo** — znak V z dwóch ramion zbiegających się w punkt (`src/components/brand/logo.tsx`, pliki SVG w `public/brand/`, favicon w `src/app/icon.svg`).
- **Strony**: główna, usługi + 12 podstron usług, pakiety, stała współpraca (abonamenty), realizacje (projekty demonstracyjne, wyraźnie oznaczone), o nas, kontakt, FAQ, blog (kategorie + wpisy z bazy), wycena, polityka prywatności, regulamin, ustawienia cookies, 404, błąd.
- **Formularze** — 6-krokowa wycena (warianty: ogólny, druk, automatyzacje, indywidualny), krótkie formularze usług i kontaktu. Walidacja Zod po obu stronach, honeypot, minimalny czas wypełnienia, limit 5 zgłoszeń / 10 min / IP, numer zgłoszenia `VEL-2026-00001`, opcjonalne powiadomienie e-mail przez Resend.
- **SEO** — unikalne meta title/description, canonical, Open Graph (`opengraph-image`), `sitemap.xml`, `robots.txt`, dane strukturalne (Organization, BreadcrumbList, Service, FAQPage).
- **Cookies** — baner i ustawienia kategorii zapisywane w ciasteczku `velio_consent`. Strona nie ładuje jeszcze żadnej analityki; przy jej dodawaniu sprawdzaj `readConsent()` z `src/lib/consent.ts`.

Logowanie, rejestracja i panel klienta to **etap 2** — strony `/logowanie` i `/rejestracja` jasno o tym informują i nie udają działającego logowania.

## Oferta w bazie danych

Usługi, pakiety, abonamenty i FAQ są w MongoDB (kolekcje `services`, `packages`, `plans`, `faqs`). Dane startowe są w `src/data/catalog.seed.json`.

- Gdy baza nie jest skonfigurowana albo jest pusta, strona pokazuje dane startowe z pliku — dzięki temu działa od pierwszego deployu.
- Zmiany w bazie są widoczne na stronie po maksymalnie 5 minutach (`revalidate = 300` w `src/app/layout.tsx`).
- Ceny i opisy będą edytowane w panelu administratora (etap 3). Do tego czasu edytuj dokumenty w bazie (np. MongoDB Compass) albo zmień JSON i uruchom `npm run seed:reset`.

Zgłoszenia trafiają do kolekcji `leads` (statusy lejka CRM są już w schemacie).

## Uruchomienie lokalne

Wymagany Node.js 22+.

```bash
npm install
cp .env.example .env      # uzupełnij MONGODB_URI (np. lokalny MongoDB albo publiczny URL z Railway)
npm run seed              # zapisuje ofertę w bazie
npm run dev               # http://localhost:3000
```

Sprawdzenie przed wypchnięciem na GitHub:

```bash
npm run typecheck
npm run build
```

Po pierwszym `npm install` **dodaj do repozytorium plik `package-lock.json`** — Railway użyje go do powtarzalnych instalacji.

## Wdrożenie na Railway

1. Wypchnij repozytorium na GitHub.
2. W Railway: **New Project → Deploy from GitHub repo** → wybierz repozytorium.
3. W tym samym projekcie: **New → Database → MongoDB**.
4. W usłudze aplikacji → **Variables** dodaj:
   - `MONGODB_URI` = `${{MongoDB.MONGO_URL}}` (referencja do bazy)
   - `MONGODB_DB` = `velio`
   - `NEXT_PUBLIC_SITE_URL` = docelowy adres (np. `https://velio.pl`) — ustaw przed buildem, trafia do sitemap i canonical
   - opcjonalnie: dane firmy `NEXT_PUBLIC_COMPANY_*`, `NEXT_PUBLIC_CONTACT_*`, social media, `NEXT_PUBLIC_VAT_RATE`
   - opcjonalnie powiadomienia: `RESEND_API_KEY`, `LEADS_NOTIFY_EMAIL`, `LEADS_FROM_EMAIL` (domena nadawcy musi być zweryfikowana w Resend)
5. **Settings → Networking → Generate Domain** (albo podepnij własną domenę).
6. Zapisz ofertę w bazie — jednorazowo, lokalnie z publicznym adresem bazy:
   skopiuj `MONGO_PUBLIC_URL` z usługi MongoDB do lokalnego `.env` jako `MONGODB_URI` i uruchom `npm run seed`.

Healthcheck: `GET /api/health` zwraca `{"status":"ok","database":"connected"}`.

Podczas `next build` aplikacja celowo nie łączy się z bazą (sieć prywatna Railway nie jest dostępna w fazie budowania) — strony są budowane z danych startowych i odświeżane z bazy po uruchomieniu.

## Struktura

```
src/
  app/                     strony (App Router), API: /api/leads, /api/health
  components/
    brand/                 logo
    layout/                nagłówek, stopka, motyw, cookies, szablony stron
    home/                  sekcje strony głównej
    forms/                 kreator wyceny, formularze, pola
    ui/                    bloki wspólne, karta pakietu, breadcrumbs, ikony
  data/catalog.seed.json   dane startowe oferty
  i18n/pl.ts               teksty interfejsu (miejsce na kolejne języki)
  lib/
    catalog/               typy i repozytorium oferty
    db/                    połączenie z MongoDB
    leads/                 schemat walidacji i zapis zgłoszeń
    models/                modele Mongoose
scripts/seed.mjs           zapis oferty w bazie
```

## Kolejne etapy

2. Konta: rejestracja, logowanie (Auth.js + MongoDB), reset hasła, role, onboarding, panel klienta.
3. Panel administratora: CRM leadów, zarządzanie ofertą i treściami, projekty, wyceny, pliki.
4. Płatności (Stripe / PayU / Przelewy24 z webhookami), raporty i integracje analityczne.

Teksty prawne (`/polityka-prywatnosci`, `/regulamin`) są szablonami do uzupełnienia i weryfikacji przez prawnika.
