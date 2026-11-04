# VELIO 2.0 — strona agencji, panel klienta i panel admina

Node.js + **MongoDB**, gotowe do wdrożenia na **Railway** z repozytorium GitHub.
Jedyna zależność: oficjalny sterownik `mongodb`. Pliki klientów (umowy, raporty, PDF-y) są zapisywane w MongoDB (GridFS), więc nic nie ginie przy restartach Railway.

Styl graficzny jak w Modulio (układ, typografia Manrope + DM Sans, akcenty szeryfowe), kolorystyka VELIO: **czerń i fiolet `#7357FF`**.

| Adres | Co to jest |
|---|---|
| `/` | Strona główna |
| `/uslugi`, `/uslugi/<usługa>` | 12 usług z cenami, zakresem, procesem i FAQ |
| `/pakiety`, `/abonamenty` | Pakiety na start i stała współpraca |
| `/wycena` | Bezpłatna wycena w 5 krokach (dostępna też jako okno na każdej stronie) |
| `/cennik` | Cennik pojedynczych usług — **bez minimum zamówienia** (edycja: /admin → Cennik usług) |
| `/blog`, `/blog/<wpis>`, `/blog/kategoria/<kat>`, `/blog/rss.xml` | Blog (edycja: /admin → Blog) |
| `/realizacje`, `/realizacje/<projekt>` | Realizacje / case studies (edycja: /admin → Realizacje) |
| `/opinie` | Prawdziwe opinie klientów + AggregateRating (edycja: /admin → Opinie) |
| `/agencja-marketingowa-slupsk`, `/strony-internetowe-slupsk`, `/pozycjonowanie-slupsk`, `/agencja-marketingowa-ustka`, `-lebork`, `-bytow`, `-miastko`, `/obszar-dzialania` | Strony lokalne z unikalną treścią (edycja: /admin → Strony lokalne) |
| `/branze`, `/branze/<branża>` | Strony branżowe (edycja: /admin → Branże) |
| `/jak-pracujemy` | Etapy współpracy |
| `/narzedzia`, `/narzedzia/test-wizytowki-google`, `/narzedzia/kalkulator-kosztu-strony`, `/narzedzia/kalkulator-budzetu-reklam` | Darmowe narzędzia |
| `/sitemap.xml`, `/robots.txt`, `/llms.txt` | Generowane automatycznie z bazy |
| `/o-nas`, `/kontakt`, `/faq`, `/regulamin`, `/polityka-prywatnosci` | Podstrony |
| `/logowanie`, `/rejestracja`, `/reset-hasla` | Logowanie klienta: **e-mail + hasło** albo **konto Google** |
| `/panel` | Panel klienta: projekty, zgłoszenia, faktury, dokumenty, ustawienia konta |
| `/admin` | Panel admina — logowanie **kodem PIN ze zmiennej `ADMIN_PIN`** |

---

## Aktualizacja istniejącego repozytorium VELIO (z wersji Next.js)

Nowa wersja nie używa już Next.js. Jeśli wrzucasz pliki przez **GitHub → Add file → Upload files**, GitHub tylko dodaje i nadpisuje pliki — **stare pliki trzeba usunąć ręcznie**, inaczej zostaną w repozytorium:

```
src/   scripts/seed.mjs   public/brand/   next.config.ts   next-env.d.ts   postcss.config.mjs   tsconfig.json
```

Pliki zaczynające się od kropki (`.gitignore`, `.env.example`) są w paczce — jeśli GitHub ich nie pokaże po wrzuceniu, dodaj je przez **Add file → Create new file** i wklej treść.

Zmienne, które już masz na Railway, nadal działają: `MONGODB_URI`, `MONGODB_DB`, `ADMIN_PIN`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_COMPANY_*`, `NEXT_PUBLIC_CONTACT_*`, `RESEND_API_KEY`, `LEADS_NOTIFY_EMAIL`, `LEADS_FROM_EMAIL`. `ADMIN_SESSION_SECRET` nie jest już potrzebny.

---

## Wdrożenie na Railway — krok po kroku

### 1. GitHub
Wrzuć zawartość paczki do repozytorium (np. `LiteBots/Velio`), gałąź `main`.

### 2. Railway
1. [railway.com](https://railway.com) → **New Project** → **Deploy from GitHub repo** → wybierz repozytorium.
2. W tym samym projekcie: **+ New** → **Database** → **MongoDB** (jeśli jeszcze nie masz).

### 3. Zmienne (usługa VELIO → **Variables**)
| Zmienna | Wartość | Wymagana |
|---|---|---|
| `MONGO_URL` | `${{MongoDB.MONGO_URL}}` (**Add Reference** → MongoDB → MONGO_URL) | ✅ |
| `ADMIN_PIN` | kod do panelu admina, 4–12 cyfr (zalecane 8+) | ✅ |
| `SITE_URL` | `https://www.velioagency.pl` — główny adres strony | zalecana |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` | logowanie przez Google (instrukcja niżej) | |
| `RESEND_API_KEY`, `MAIL_FROM` | e-maile: reset hasła, powiadomienia | |
| `LEADS_NOTIFY_EMAIL` | adres, na który przychodzą powiadomienia o zapytaniach | |
| `COMPANY_LEGAL_NAME`, `COMPANY_ADDRESS`, `COMPANY_NIP`, `CONTACT_EMAIL`, `CONTACT_PHONE` | dane firmy (można też w /admin → Ustawienia) | |

Pełna lista z opisami: `.env.example`. `PORT` ustawia Railway sam.

### 4. Domena
Usługa → **Settings** → **Networking** → **Generate Domain** albo **Custom Domain**. Po podpięciu własnej domeny ustaw `SITE_URL`.

### 5. Gotowe
Railway zainstaluje zależności i uruchomi `npm start`. Healthcheck: `/healthz`.
Wejdź na `https://twoja-domena/admin` i wpisz kod z `ADMIN_PIN`. Każdy `git push` na `main` = nowe wdrożenie.

---

## SEO — co jest wdrożone i co ustawić po wdrożeniu
- **Domena główna włącza się sama:** co 5 minut serwer sprawdza, czy `https://velioagency.pl/healthz` prowadzi do tej aplikacji. Dopóki nie (np. brak DNS), strona działa pod adresem Railway bez przekierowań. Gdy domena zacznie działać: **canonical zawsze na `https://velioagency.pl`** (adres `*.up.railway.app` nigdy nie jest kanoniczny). Wejścia na adres Railway i na `www.` dostają **301** na główną domenę. Inną domenę główną ustawisz zmienną `SITE_URL`. Wyłączenie przekierowań: `CANONICAL_REDIRECT=false`.
- Adresy z wielkimi literami i końcowym `/` → 301 na wersję kanoniczną. Własna strona 404.
- Schema.org (JSON-LD): `ProfessionalService` (NAP, areaServed, geo, godziny, sameAs) na każdej stronie, `Service` + oferty na stronach usług, `OfferCatalog` w cenniku, `FAQPage`, `BreadcrumbList`, `BlogPosting` + `Person` na blogu, `AggregateRating` tylko z prawdziwych opinii.
- Title i description każdej podstrony edytowalne w **/admin → SEO** (z licznikiem znaków), tam też `noindex` i obrazek OG.
- **/admin → Ustawienia → SEO lokalne, wizytówka i pomiar**: adres (NAP identyczny jak w wizytówce), godziny, social media, link do wizytówki (sameAs), mapa na /kontakt, kody weryfikacji Google/Bing, GTM / GA4.
- GA4 / Google Tag Manager ładują się tylko po ustawieniu ID; baner zgód działa w **Consent Mode v2** (domyślnie „denied”).
- Weryfikacja Google Search Console: najlepiej rekord **DNS TXT** u rejestratora (obejmuje www i bez www, nie zniknie przy deployu). Alternatywnie kod meta albo nazwa pliku `googleXXXX.html` w ustawieniach (plik serwuje się sam).

| Zmienna (opcjonalna) | Opis |
|---|---|
| `SITE_URL` | domyślnie `https://velioagency.pl` |
| `CANONICAL_REDIRECT` | `false` wyłącza 301 na główną domenę |
| `GTM_ID` / `GA4_ID` | można też w panelu |
| `GOOGLE_SITE_VERIFICATION`, `GOOGLE_VERIFICATION_FILE`, `BING_SITE_VERIFICATION` | można też w panelu |
| `COMPANY_STREET`, `COMPANY_POSTAL_CODE`, `COMPANY_CITY` | adres NAP (można też w panelu) |

## Panel admina i kod PIN
- Logowanie tylko kodem z `ADMIN_PIN`. Zmiana kodu w Variables wylogowuje wszystkie sesje admina.
- Po 5 błędnych kodach z jednego urządzenia — blokada na 15 minut; po 30 błędach w godzinie — blokada logowania na 30 minut dla nieznanych urządzeń. Urządzenie, na którym już się logowano, wejdzie mimo tej blokady (po wpisaniu poprawnego kodu). Liczniki są w bazie, więc restart ich nie zeruje.
- Logowanie dwuskładnikowe: `npm run cli -- admin:totp` generuje sekret. Dodaj go w aplikacji Authenticator, a potem ustaw zmienną `ADMIN_TOTP_SECRET`. Od tej chwili logowanie wymaga PIN-u i kodu z aplikacji.
- Zablokowałeś się sam? `MONGO_URL="…publiczny adres bazy…" npm run cli -- admin:unlock`.

| Moduł | Możliwości |
|---|---|
| **Pulpit / Statystyki** | Lista gotowości strony (brakujące dane, opinie, DNS, bezpieczeństwo), kontakty z leadami do wykonania, przychody, MRR, klienci, należności, lejek, wykresy |
| **Leady** | Zapytania z formularza i wyceny (kanban), termin następnego kontaktu, źródło, kampania i pierwsza odwiedzona strona, zamiana leada w klienta z kontem i projektem |
| **Użytkownicy** | Konta klientów, reset hasła, blokada, podgląd panelu klienta |
| **Płatności** | Faktury z VAT, kody rabatowe, wpłaty, CSV |
| **Projekty** | Etapy (brief → projekt → realizacja → akceptacja → uruchomione → optymalizacja), kamienie milowe, aktualizacje dla klienta |
| **Aktywne usługi** | Abonamenty (opieka, reklamy, SEO, AI) z opłatą i odnowieniem |
| **Zgłoszenia, Dokumenty** | Wątki z klientami, pliki do 10 MB |
| **Oferta i ceny** | Pełna edycja usług, pakietów, abonamentów i FAQ (ceny, zakres, listy, kolejność, SEO) oraz dodawanie własnych pakietów, abonamentów i pytań — zmiana od razu na stronie |
| **Cennik usług** | Pojedyncze usługi z ceną „od” (lub wyceną indywidualną) — dodawanie, edycja, kolejność, wyróżnienie |
| **Blog, Realizacje, Opinie, Branże, Strony lokalne** | Pełna edycja treści (markdown z podglądem), wersje robocze, wpisy zaplanowane na datę, duplikowanie, adresy (slug) |
| **SEO** | Title, description, OG i noindex każdej podstrony; wykrywanie zbyt długich i powtórzonych meta |
| **Marketing, Dziennik, Ustawienia** | Ogłoszenia w panelu klienta, newsletter (zapis i wypisanie), szablon prośby o opinię, kody rabatowe, historia zdarzeń, dane firmy, tryb serwisowy |

---

## Logowanie przez Google — konfiguracja (ok. 5 minut)
1. [console.cloud.google.com](https://console.cloud.google.com) → utwórz projekt (np. „VELIO”).
2. **APIs & Services → OAuth consent screen**: typ **External**, nazwa „VELIO”, e-mail kontaktowy, zakresy `email`, `profile`, `openid`. Opublikuj aplikację (**Publish app**).
3. **APIs & Services → Credentials → Create credentials → OAuth client ID** → typ **Web application**.
4. **Authorized redirect URIs**: `https://TWOJA-DOMENA/api/auth/google/callback` (dokładny adres pokazuje panel admina → Ustawienia → Logowanie).
5. Skopiuj **Client ID** i **Client secret** do Railway: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`.

Bez tych zmiennych przycisk Google się nie pokazuje, a klienci logują się e-mailem i hasłem.
Konto Google z tym samym e-mailem co istniejące konto zostaje z nim połączone. Klient zalogowany przez Google może w ustawieniach konta dodać hasło.

## E-maile (Resend)
Reset hasła i powiadomienia o nowych zapytaniach wysyłane są przez [resend.com](https://resend.com). Zweryfikuj domenę w Resend, ustaw `RESEND_API_KEY` i `MAIL_FROM` (np. `VELIO <kontakt@velioagency.pl>`). Bez tego strona działa, ale e-maile nie wychodzą.

---

## Uruchomienie lokalne
```bash
npm install
npm test                                # testy stron, SEO i panelu admina
ADMIN_PIN=12345678 npm start            # bez MONGO_URL: baza w pamięci + dane demo (znikają po restarcie)
MONGO_URL="mongodb://..." ADMIN_PIN=12345678 npm start
```
Klient demo: `demo@velio.pl` / `Demo1234!`. Panel admina: kod z `ADMIN_PIN`.

## Narzędzia awaryjne (CLI)
```bash
MONGO_URL="..." npm run cli -- help
MONGO_URL="..." npm run cli -- user:password --email klient@firma.pl
MONGO_URL="..." npm run cli -- admin:unlock
```

## Struktura
```
server/
  index.js          serwer HTTP, trasy stron, pliki statyczne, tryb serwisowy
  config.js         konfiguracja ze zmiennych (Railway Variables)
  data/catalog.json oferta startowa: usługi, pakiety, abonamenty, FAQ
  web/catalog.js    oferta z bazy (zmiany z /admin/oferta) + dane startowe
  web/pages.js      generowanie stron i SEO (sitemap, dane strukturalne)
  web/pages-extra.js branże, jak pracujemy, narzędzia, sekcje strony głównej
  api/              public (kontakt, logowanie, Google, reset hasła, PIN), client, admin, admin-catalog
  lib/              auth, http, mail (Resend), settings, audit, csv, money
  db/               MongoDB / baza w pamięci, dane demo
views/              partials · site · auth · client · admin
public/assets/      css · js · img · icons.svg
scripts/            cli.js, build-icons.js
test/               testy całej aplikacji (npm test)
```

## Kopie zapasowe
Railway → MongoDB → **Backups** albo `mongodump` z publicznego adresu bazy. Wszystko — łącznie z plikami klientów — jest w jednej bazie.

## Aktualizacja 2.1 — co zrobić po wdrożeniu
Nowe treści (branże, wpisy, strony lokalne, pozycje cennika) wgrywają się do bazy raz i nie nadpisują Twoich zmian. Nowe pakiety i abonamenty są widoczne od razu.

1. Otwórz `/admin` i przejdź listę **Gotowość strony** na pulpicie. Pokazuje brakujące dane firmy, opinie i ustawienia.
2. W home.pl ustaw przekierowanie `velioagency.pl` na `https://www.velioagency.pl`.
3. Sprawdź ceny nowych pakietów i abonamentów w **Oferta i ceny**. Są propozycją do Twojej decyzji.
4. Ustaw repozytorium GitHub jako prywatne.
