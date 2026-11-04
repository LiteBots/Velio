// =====================================================================
//  Dane startowe treści (wgrywane do bazy JEDEN raz, potem edycja w /admin).
//  Ceny w cenniku to PROPOZYCJA do weryfikacji — zmienisz je w panelu:
//  /admin/tresci/price_items
// =====================================================================

const AUTHOR = 'Gracjan Błachnio';
let o = 0;
const item = (service, name, price, unit, note, extra = {}) => ({ service, name, price, unit, note, order: (o += 10), published: true, popular: false, ...extra });

const price_items = [
  // Strony internetowe
  item('strony-internetowe', 'Strona wizytówka (one page)', 690, 'netto', 'Jedna strona z ofertą, danymi kontaktowymi, mapą i formularzem. Dobra na start dla małej firmy.', { popular: true }),
  item('strony-internetowe', 'Landing page pod kampanię', 990, 'netto', 'Strona sprzedażowa pod jedną usługę lub kampanię Google/Meta, z pomiarem konwersji.'),
  item('strony-internetowe', 'Strona firmowa (do 6 podstron)', 1290, 'netto', 'Strona główna, oferta, o nas, realizacje, kontakt i blog. Podstawowe SEO w cenie.'),
  item('strony-internetowe', 'Sklep internetowy', 1390, 'netto', 'Katalog produktów, koszyk, płatności i dostawy. Zakres zależy od liczby produktów i integracji.'),
  item('strony-internetowe', 'Dodatkowa podstrona', 150, 'netto', 'Nowa podstrona w istniejącym szablonie strony.'),
  item('strony-internetowe', 'Poprawki i prace na stronie', 120, 'netto / godz.', 'Zmiany treści, drobne funkcje, naprawa błędów. Rozliczenie godzinowe, wycena przed startem.'),
  item('strony-internetowe', 'Opieka nad stroną', 149, 'netto / mies.', 'Aktualizacje, kopie zapasowe, monitoring dostępności i drobne poprawki w limicie.'),
  // Wizytówka Google
  item('wizytowka-google', 'Założenie i uzupełnienie wizytówki Google', 299, 'netto', 'Profil Firmy: kategorie, opis, usługi, godziny, zdjęcia, link do strony i pomoc przy weryfikacji.', { popular: true }),
  item('wizytowka-google', 'Optymalizacja istniejącej wizytówki', 249, 'netto', 'Poprawa kategorii, opisu, usług i zdjęć, uporządkowanie danych NAP.'),
  item('wizytowka-google', 'Prowadzenie wizytówki Google', 199, 'netto / mies.', 'Posty, nowe zdjęcia, odpowiedzi na opinie i krótki raport co miesiąc.'),
  // SEO
  item('pozycjonowanie-seo', 'Audyt SEO strony', 690, 'netto', 'Technika, treści, linki i konkurencja. Lista poprawek z priorytetami.'),
  item('pozycjonowanie-seo', 'SEO lokalne na start', 990, 'netto', 'Optymalizacja strony i wizytówki pod frazy z miastem, dane strukturalne, katalogi lokalne.'),
  item('pozycjonowanie-seo', 'Abonament SEO', 990, 'netto / mies.', 'Stałe prace techniczne, treści i linki, a do tego miesięczny raport.'),
  // Reklamy
  item('reklamy-platne', 'Konfiguracja kampanii Google Ads', 990, 'netto', 'Struktura kampanii, słowa kluczowe, reklamy i pomiar konwersji. Budżet reklamowy osobno.'),
  item('reklamy-platne', 'Konfiguracja kampanii Meta Ads (Facebook, Instagram)', 790, 'netto', 'Grupy odbiorców, kreacje, formularz kontaktowy lub ruch na stronę, piksel. Budżet reklamowy osobno.'),
  item('reklamy-platne', 'Prowadzenie kampanii', 490, 'netto / mies.', 'Optymalizacja, testy reklam, raport. Budżet płacisz bezpośrednio Google lub Meta.'),
  // Social media
  item('social-media', 'Odświeżenie profili Facebook i Instagram', 390, 'netto', 'Zdjęcie profilowe, okładka, opis, wyróżnione relacje i dane kontaktowe.'),
  item('social-media', 'Pojedyncza grafika lub post', 79, 'netto', 'Grafika w stylu marki z tekstem do publikacji.'),
  item('social-media', 'Prowadzenie social media', 990, 'netto / mies.', 'Plan treści, 8–12 postów, relacje i raport. Zakres ustalany w wycenie.'),
  // Analityka
  item('analityka-i-pomiar', 'Google Analytics 4 + Tag Manager + zgody (Consent Mode v2)', 590, 'netto', 'Konfiguracja pomiaru formularzy i telefonów, baner cookies zgodny z wymaganiami Google.'),
  item('analityka-i-pomiar', 'Google Search Console i Bing Webmaster Tools', 149, 'netto', 'Weryfikacja domeny (DNS), mapa strony, sprawdzenie indeksowania.'),
  // AI i automatyzacje
  item('ai-i-automatyzacje', 'Chatbot AI na stronę', 1490, 'netto', 'Asystent odpowiadający na pytania o ofertę i zbierający zapytania. Koszt modelu AI osobno.'),
  item('ai-i-automatyzacje', 'Automatyzacja: formularz → CRM / e-mail / arkusz', 690, 'netto', 'Zapytania same trafiają tam, gdzie pracujesz, z powiadomieniem.'),
  item('ai-i-automatyzacje', 'Automatyzacja procesu w firmie', null, '', 'Oferty, faktury, raporty, obsługa zapytań. Wycena po krótkiej analizie procesu.'),
  // Branding i druk
  item('branding', 'Projekt logo', 690, 'netto', '2–3 propozycje, poprawki w ustalonym limicie, pliki do druku i internetu.', { popular: true }),
  item('branding', 'Identyfikacja wizualna z księgą znaku', 1990, 'netto', 'Logo, kolory, typografia, wzory materiałów i zasady stosowania.'),
  item('druk-i-materialy', 'Projekt wizytówek', 149, 'netto', 'Projekt dwustronny, przygotowanie do druku. Druk wyceniany osobno według nakładu.'),
  item('druk-i-materialy', 'Projekt ulotki', 249, 'netto', 'Ulotka A5/DL, przygotowanie do druku.'),
  item('druk-i-materialy', 'Projekt banera lub roll-upu', 249, 'netto', 'Projekt w wymiarze drukarni, przygotowanie plików.'),
  item('odziez-i-gadzety', 'Odzież i gadżety z logo', null, '', 'Cena zależy od produktu, techniki znakowania i nakładu.'),
  // CRM i e-mail
  item('email-marketing-i-crm', 'Wdrożenie CRM', 1490, 'netto', 'Konfiguracja, import kontaktów, etapy sprzedaży i połączenie z formularzami. Licencja osobno.'),
  item('email-marketing-i-crm', 'Newsletter: szablon i konfiguracja', 590, 'netto', 'Szablon w stylu marki, lista, formularz zapisu i pierwsza wysyłka.'),
  // Strategia
  item('strategia-i-leady', 'Konsultacja marketingowa (60 min)', 199, 'netto', 'Rozmowa o Twojej sytuacji i lista konkretnych kroków. Odliczamy od późniejszego zlecenia.'),
  item('strategia-i-leady', 'Audyt marketingowy firmy', 990, 'netto', 'Strona, wizytówka, social media, reklamy i konkurencja. Raport z planem działań.'),
  item('strategia-i-leady', 'Strategia marketingowa', null, '', 'Grupa docelowa, kanały, budżet i harmonogram. Wycena zależna od skali firmy.'),
  item('employer-branding', 'Kampania rekrutacyjna', null, '', 'Strona kariery, ogłoszenia i reklamy rekrutacyjne. Wycena indywidualna.'),
  item('ekspansja-zagraniczna', 'Wersja językowa strony', null, '', 'Tłumaczenie, lokalizacja i SEO na rynek zagraniczny. Wycena według zakresu.'),
];

// ---------------------------------------------------------------------
// Blog
// ---------------------------------------------------------------------
const posts = [
  {
    slug: 'ile-kosztuje-strona-internetowa',
    title: 'Ile kosztuje strona internetowa w 2026 roku? Ceny i od czego zależą',
    category: 'Strony WWW',
    excerpt: 'Strona wizytówka, firmowa, landing page czy sklep: ile realnie kosztują, co wpływa na cenę i jakie koszty dochodzą po uruchomieniu.',
    seo_title: 'Ile kosztuje strona internetowa w 2026? Ceny',
    seo_description: 'Ceny stron internetowych w 2026: wizytówka, strona firmowa, landing page i sklep. Co wpływa na koszt, jakie są opłaty stałe i jak porównać oferty.',
    services: ['strony-internetowe', 'pozycjonowanie-seo'],
    author: AUTHOR,
    published_at: '2026-10-27',
    published: true,
    body: `Pytanie „ile kosztuje strona internetowa?” przypomina pytanie „ile kosztuje samochód?”. Odpowiedź zależy od tego, do czego strona ma służyć. Poniżej rozpisujemy typowe rodzaje stron, widełki cenowe i koszty, o których łatwo zapomnieć.

## Rodzaje stron i orientacyjne ceny

| Rodzaj strony | Dla kogo | Orientacyjna cena (netto) |
| --- | --- | --- |
| Strona wizytówka (one page) | Mała firma, start działalności | od ok. 700 zł |
| Landing page | Jedna usługa, kampania reklamowa | od ok. 1 000 zł |
| Strona firmowa (kilka podstron) | Firma usługowa, która chce pozycjonowania | od ok. 1 300 zł |
| Sklep internetowy | Sprzedaż online | od ok. 1 400 zł |
| Rozbudowany serwis lub aplikacja | Portale, systemy rezerwacji, panele klienta | wycena indywidualna |

To widełki z naszego [cennika](/cennik). Na rynku spotkasz zarówno strony za kilkaset złotych, jak i za kilkadziesiąt tysięcy. Różnica bierze się z zakresu prac, a nie tylko z „marży agencji”.

## Co najbardziej wpływa na cenę strony

- **Liczba podstron i treści.** Każda usługa opisana na osobnej podstronie to więcej pracy, ale też więcej szans w Google.
- **Projekt: szablon czy indywidualny.** Gotowy szablon jest tańszy. Projekt od zera lepiej pasuje do marki i celu.
- **Teksty i zdjęcia.** Jeśli dostarczasz je sam, płacisz mniej. Pisanie treści pod SEO to osobna praca.
- **Funkcje.** Rezerwacje, kalkulatory, panel klienta, integracje z CRM czy systemem faktur podnoszą koszt.
- **SEO i pomiar.** Poprawna struktura nagłówków, dane strukturalne, szybkość i konfiguracja Google Analytics to rzeczy, które warto zrobić od razu, a nie poprawiać później.

## Koszty po uruchomieniu strony

Cena wykonania to nie wszystko. Policz też koszty stałe:

1. **Domena.** Zwykle od kilkudziesięciu do ok. 150 zł rocznie za domenę .pl. Uważaj na promocje na pierwszy rok i dużo wyższe odnowienie.
2. **Hosting.** Od kilkudziesięciu złotych miesięcznie za prostą stronę do więcej przy sklepach i dużym ruchu.
3. **Opieka techniczna.** Aktualizacje, kopie zapasowe i reakcja na awarie. U nas [opieka nad stroną](/abonamenty#opieka-nad-strona) zaczyna się od 149 zł netto miesięcznie.
4. **Rozwój i promocja.** Sama strona rzadko przyprowadza klientów. Potrzebna jest [wizytówka Google](/uslugi/wizytowka-google), SEO albo reklamy.

## Jak porównywać oferty

Gdy dostajesz kilka wycen, sprawdź w każdej:

- czy treści i zdjęcia są w cenie,
- ile jest rund poprawek,
- czy dostajesz dostęp do domeny, hostingu i kodu (powinny być Twoje),
- czy jest podstawowe SEO i pomiar konwersji,
- kto i za ile zajmuje się stroną po uruchomieniu.

Najtańsza oferta często pomija właśnie te punkty, więc po kilku miesiącach płacisz drugi raz.

## Ile kosztuje strona w VELIO

Nie mamy minimalnej kwoty zamówienia. Prosta strona wizytówka zaczyna się od 690 zł netto, landing page od 990 zł, a strona firmowa z kilkoma podstronami od 1 290 zł. Większe projekty wyceniamy po krótkiej rozmowie, z rozpisanym zakresem i kosztami zewnętrznymi. [Zamów bezpłatną wycenę](/wycena) albo zobacz, [jak robimy strony internetowe](/uslugi/strony-internetowe).`,
  },
  {
    slug: 'jak-zalozyc-wizytowke-google',
    title: 'Jak założyć wizytówkę Google (Profil Firmy) krok po kroku',
    category: 'Marketing lokalny',
    excerpt: 'Zakładanie Profilu Firmy w Google od zera: nazwa, kategorie, obszar działania, weryfikacja i to, co zrobić po niej, żeby wizytówka przyprowadzała klientów.',
    seo_title: 'Jak założyć wizytówkę Google krok po kroku',
    seo_description: 'Instrukcja zakładania Profilu Firmy w Google: nazwa, kategoria, obszar działania, weryfikacja i optymalizacja. Najczęstsze błędy i jak ich uniknąć.',
    services: ['wizytowka-google', 'pozycjonowanie-seo'],
    author: AUTHOR,
    published_at: '2026-10-27',
    published: true,
    body: `Wizytówka Google, czyli Profil Firmy w Google, to bezpłatne narzędzie, dzięki któremu firma pojawia się w Mapach Google i w wynikach lokalnych. Dla firm usługowych z mniejszych miast to często najważniejsze źródło telefonów. Oto jak ją założyć i ustawić.

## Krok 1. Dodaj firmę

Wejdź na stronę Profilu Firmy w Google i zaloguj się kontem Google, które będzie zarządzać wizytówką. Najlepiej konto firmowe, a nie prywatne konto pracownika. Wpisz nazwę firmy i sprawdź, czy wizytówka już nie istnieje. Jeśli istnieje, poproś o dostęp zamiast zakładać drugą.

## Krok 2. Nazwa firmy bez słów kluczowych

Wpisz nazwę dokładnie taką, jakiej używasz w rzeczywistości (na szyldzie, fakturach, stronie). Dopisywanie fraz typu „Hydraulik Słupsk tanio” jest niezgodne z zasadami Google i może skończyć się zawieszeniem profilu.

## Krok 3. Kategoria główna i dodatkowe

Kategoria główna ma duży wpływ na to, na jakie zapytania pokaże się wizytówka. Wybierz najbardziej precyzyjną, a potem dodaj kategorie dodatkowe dla pozostałych usług. Podpatrz, jakie kategorie mają firmy z czołówki w Twojej branży.

## Krok 4. Adres albo obszar działania

- Jeśli **przyjmujesz klientów w lokalu**, podaj adres.
- Jeśli **dojeżdżasz do klientów** (np. budowlanka, sprzątanie, transport) i nie masz biura dla klientów, ustaw obszar działania, np. Słupsk, Ustka, Lębork, i ukryj adres.

## Krok 5. Telefon i strona internetowa

Podaj numer, pod którym ktoś faktycznie odbiera. Link do strony warto oznaczyć parametrem UTM (np. ?utm_source=google&utm_medium=organic&utm_campaign=gbp), żeby w Google Analytics widzieć, ile ruchu daje wizytówka.

## Krok 6. Weryfikacja

Bez weryfikacji wizytówka nie będzie w pełni widoczna. Google sam wybiera metodę. Obecnie najczęściej jest to **krótkie nagranie wideo** pokazujące oznakowanie firmy, miejsce pracy i dowód prowadzenia działalności. Czasem dostępny jest telefon, SMS, e-mail albo kartka pocztowa. Przygotuj się przed nagraniem: dobre światło, widoczne logo lub oznakowany samochód, narzędzia pracy.

> Weryfikacja wizytówki to co innego niż weryfikacja strony w Google Search Console. Pliku HTML na stronie nie używa się do wizytówki.

## Krok 7. Uzupełnij wszystko, co się da

Po weryfikacji dodaj:

- opis firmy (do 750 znaków) z informacją, co robisz i gdzie,
- usługi i ceny „od”,
- godziny otwarcia i godziny świąteczne,
- logo, zdjęcie w tle i co najmniej kilkanaście prawdziwych zdjęć: zespół, realizacje, samochód, biuro,
- atrybuty (np. płatność kartą, faktura VAT).

## Krok 8. Opinie i posty

Opinie to jeden z najsilniejszych czynników w wynikach lokalnych. Proś o nie zadowolonych klientów, najlepiej wysyłając bezpośredni link, i **odpowiadaj na każdą opinię**, również negatywną, rzeczowo i bez emocji. Nie kupuj opinii, bo Google je usuwa i może nałożyć ograniczenia na profil. Publikuj też posty, np. raz w tygodniu: realizacja, promocja, nowa usługa.

## Najczęstsze błędy

- Inny adres lub telefon na stronie, w wizytówce i w katalogach. Dane NAP (nazwa, adres, telefon) muszą być wszędzie identyczne.
- Brak zdjęć albo same zdjęcia stockowe.
- Wizytówka założona na prywatne konto osoby, która już nie pracuje w firmie.
- Brak reakcji na opinie.

## Chcesz, żebyśmy zrobili to za Ciebie?

[Zakładamy i prowadzimy wizytówki Google](/uslugi/wizytowka-google) jako osobną usługę, bez pakietu. Założenie i uzupełnienie profilu kosztuje od 299 zł netto, a stałe prowadzenie od 199 zł miesięcznie. Szczegóły są w [cenniku](/cennik).`,
  },
  {
    slug: 'reklama-na-facebooku-dla-firmy-lokalnej',
    title: 'Reklama na Facebooku dla firmy lokalnej. Od czego zacząć?',
    category: 'Reklamy Google i Meta',
    excerpt: 'Jak ustawić pierwszą kampanię Meta Ads dla lokalnej firmy: cel, odbiorcy z okolicy, kreacje, budżet i pomiar. Bez przepalania pieniędzy na „promowanie posta”.',
    seo_title: 'Reklama na Facebooku dla firmy lokalnej — poradnik',
    seo_description: 'Pierwsza kampania Meta Ads dla firmy lokalnej: wybór celu, kierowanie na okolicę, kreacje, budżet testowy i mierzenie kosztu pozyskania klienta.',
    services: ['reklamy-platne', 'social-media'],
    author: AUTHOR,
    published_at: '2026-10-27',
    published: true,
    body: `Reklama na Facebooku i Instagramie (Meta Ads) może przyprowadzić klientów z okolicy taniej niż ulotki. Pod warunkiem, że kampania jest ustawiona pod konkretny cel, a nie tylko „podbija” posty. Oto plan na start.

## 1. Menedżer reklam zamiast przycisku „Promuj”

Przycisk „Promuj post” jest wygodny, ale daje mało kontroli. Kampanie lepiej tworzyć w Menedżerze reklam. Tam wybierzesz cel, dokładnie ustawisz odbiorców i zobaczysz, ile kosztuje jedno zapytanie. Zanim zaczniesz, uporządkuj konta w Meta Business Suite (portfolio biznesowe), żeby strona, konto reklamowe i płatności należały do firmy.

## 2. Wybierz cel kampanii

Meta ma sześć celów kampanii: rozpoznawalność, ruch, aktywność, kontakty (leady), promocję aplikacji i sprzedaż. Dla firmy usługowej najczęściej sprawdzają się:

- **Kontakty (leady):** formularz otwiera się bezpośrednio w Facebooku lub Instagramie, a klient nie musi wchodzić na stronę.
- **Ruch** albo **sprzedaż:** gdy masz dobrą stronę z formularzem i zainstalowany piksel Meta.
- **Rozpoznawalność:** dla nowej firmy w małym mieście, żeby ludzie z okolicy zapamiętali markę.

## 3. Odbiorcy z okolicy

Ustaw lokalizację na swoje miasto z promieniem albo na kilka miejscowości, w których działasz, np. Słupsk, Ustka i okoliczne gminy. Na start nie zawężaj odbiorców zbyt mocno zainteresowaniami. Algorytm Meta lepiej radzi sobie z szerszą grupą, jeśli dobrze dobierzesz cel i kreację. Jeśli reklamujesz oferty pracy, nieruchomości lub kredyty, kampania musi być oznaczona jako specjalna kategoria reklam, a opcje kierowania są wtedy ograniczone.

## 4. Kreacja, która zatrzymuje kciuk

- Prawdziwe zdjęcia i krótkie wideo z realizacji działają lepiej niż zdjęcia stockowe.
- W pierwszym zdaniu napisz, co oferujesz i gdzie, np. „Montaż klimatyzacji w Słupsku i okolicy, termin w tym tygodniu”.
- Daj jasny powód do kontaktu: bezpłatna wycena, termin, cena „od”.
- Przygotuj 2–3 wersje reklamy, żeby po kilku dniach zostawić tę, która działa najlepiej.

## 5. Budżet testowy i pomiar

Nie ma jednej dobrej kwoty. Dla lokalnej firmy rozsądny test to zwykle budżet dzienny, który po 1–2 tygodniach da kilkadziesiąt kliknięć lub kilka zapytań, żeby było z czego wyciągać wnioski. Najważniejsza liczba to **koszt pozyskania zapytania**, a nie liczba polubień. Porównaj go z tym, ile zarabiasz na jednym kliencie.

Żeby mierzyć zapytania ze strony, zainstaluj piksel Meta, a najlepiej także Conversions API. Pamiętaj o banerze zgód na cookies. Jeśli używasz formularzy w Facebooku, ustaw powiadomienia albo automatyczne przekazywanie leadów do e-maila lub CRM, bo na zapytanie trzeba odpowiedzieć szybko.

## 6. Reklama to nie wszystko

Kampania kieruje ludzi na Twój profil i stronę. Jeśli profil jest pusty, a strona nie działa na telefonie, część klientów i tak odpadnie. Dlatego reklamy najlepiej działają razem z [regularnie prowadzonymi social mediami](/uslugi/social-media) i porządną stroną.

## Pomożemy ustawić kampanię

[Konfigurujemy kampanie Meta Ads](/uslugi/reklamy-platne) od 790 zł netto (budżet reklamowy płacisz bezpośrednio Meta) i możemy je dalej prowadzić w abonamencie. Napisz, co chcesz promować. Zaproponujemy cel, odbiorców i budżet testowy. [Bezpłatna wycena](/wycena).`,
  },
];

// ---------------------------------------------------------------------
// Realizacje (bez zmyślonych liczb — wyniki uzupełnisz w panelu)
// ---------------------------------------------------------------------
const cases = [
  {
    slug: 'revserwis-strona-i-panel',
    title: 'RevSerwis: strona usług z wyceną online i panel do zarządzania zleceniami',
    client: 'RevSerwis',
    industry: 'Przeprowadzki, transport i opróżnianie',
    city: 'Słupsk',
    url: 'https://www.revserwis.pl',
    summary: 'Strona z wyceną krok po kroku ze zdjęciami, lokalne SEO dla Pomorza i panel RevMi dla zespołu: zlecenia, klienci, finanse i flota.',
    problem: 'Firma usługowa ze Słupska (przeprowadzki, opróżnianie mieszkań, transport, wywóz gabarytów) obsługiwała zapytania telefonicznie i przez komunikatory. Wyceny wymagały wielu wiadomości, a zlecenia, koszty i ekipy były rozproszone w notatkach.',
    solution: `- Strona z osobnymi podstronami usług i obszaru działania (Słupsk, Ustka, Koszalin, Sławno, Bytów, Miastko).
- Formularz wyceny krok po kroku, z możliwością dodania zdjęć. Zapytanie od razu trafia do panelu i na powiadomienia zespołu.
- Panel RevMi: zlecenia i ich statusy, klienci, przychody i wydatki, flota, pracownicy z logowaniem PIN (PWA na telefon).
- Ciemny projekt w kolorach marki, nastawiony na czytelność na telefonie.
- Podstawy lokalnego SEO i przygotowanie pod wizytówkę Google.`,
    results: [],
    services: ['strony-internetowe', 'ai-i-automatyzacje', 'pozycjonowanie-seo'],
    order: 10,
    published: true,
  },
];

// ---------------------------------------------------------------------
// Strony lokalne — każda z inną treścią (Google karze kopie)
// ---------------------------------------------------------------------
const locals = [
  {
    slug: 'agencja-marketingowa-slupsk', city: 'Słupsk', service: '', order: 10, published: true,
    h1: 'Agencja marketingowa w Słupsku',
    lead: 'VELIO to agencja ze Słupska. Robimy strony internetowe, wizytówki Google, SEO, reklamy i social media dla firm ze Słupska i okolic. Spotkamy się u Ciebie w firmie, a nie tylko na wideorozmowie.',
    seo_title: 'Agencja marketingowa Słupsk — strony, SEO, reklamy',
    seo_description: 'Agencja marketingowa ze Słupska: strony www, wizytówki Google, pozycjonowanie, reklamy Google i Meta, social media. Bez minimum zamówienia.',
    body: `## Lokalnie, czyli na miejscu

Jesteśmy ze Słupska, więc znamy lokalny rynek: firmy usługowe, gastronomię, handel i branżę budowlaną, które walczą o tych samych klientów z miasta i okolicznych gmin. Spotkanie w Twojej firmie, zdjęcia na miejscu czy szybka poprawka przed weekendem to dla nas zwykły dzień pracy, a nie wyjazd.

## Od czego zaczynają firmy ze Słupska

Najczęściej od podstaw, które szybko dają telefony:

- **[Wizytówka Google](/uslugi/wizytowka-google)**, bo klienci szukają „w pobliżu” na telefonie, a w Mapach widzą tylko kilka firm.
- **[Strona internetowa](/uslugi/strony-internetowe)**, która ładuje się szybko, ma ceny „od” i prosty formularz.
- **[SEO lokalne](/pozycjonowanie-slupsk)** na frazy typu „usługa + Słupsk”.
- **[Reklamy na Facebooku i w Google](/uslugi/reklamy-platne)** kierowane tylko na Słupsk i okolice, żeby budżet nie szedł na całą Polskę.

## Bez minimum zamówienia

Nie musisz kupować pakietu. Jeśli potrzebujesz tylko wizytówki Google, logo albo poprawek na stronie, wycenimy tylko to. Ceny „od” są w [cenniku](/cennik). Gdy chcesz zrobić więcej naraz, zaproponujemy [pakiet](/pakiety) albo stałą współpracę.

## Jak pracujemy

1. Krótka rozmowa, osobiście w Słupsku albo telefonicznie.
2. Wycena z rozpisanym zakresem i terminem.
3. Realizacja, a postęp widzisz w panelu klienta.
4. Pomiar: wiesz, ile zapytań przyszło ze strony, wizytówki i reklam.`,
    faq: [
      'Czy przyjeżdżacie na spotkania w Słupsku? | Tak. Spotykamy się w Twojej firmie albo w dogodnym miejscu w Słupsku. Możemy też porozmawiać online.',
      'Czy robicie małe zlecenia? | Tak. Nie ma minimalnej kwoty zamówienia, np. założenie wizytówki Google kosztuje od 299 zł netto.',
      'Ile trwa zrobienie strony? | Prosta strona wizytówka zwykle 1–2 tygodnie od otrzymania materiałów. Termin podajemy w wycenie.',
    ],
  },
  {
    slug: 'strony-internetowe-slupsk', city: 'Słupsk', service: 'strony-internetowe', order: 20, published: true,
    h1: 'Strony internetowe w Słupsku',
    lead: 'Projektujemy i wdrażamy strony dla firm ze Słupska: od prostej wizytówki za 690 zł netto po sklepy i serwisy z panelem klienta. Szybkie, przygotowane pod Google i telefon.',
    seo_title: 'Strony internetowe Słupsk — projekt i wdrożenie',
    seo_description: 'Tworzenie stron internetowych w Słupsku: wizytówki, strony firmowe, landing page i sklepy. Szybkie, pod SEO i telefony. Od 690 zł netto.',
    body: `## Strona, która ma zadanie

Klient ze Słupska, który szuka usługi, zwykle robi to na telefonie i porównuje 2–3 firmy. Wygrywa ta, której strona szybko się ładuje, od razu mówi, co i gdzie robi, i pozwala zadzwonić jednym kliknięciem. Tak projektujemy każdą stronę.

## Rodzaje stron, które robimy

- **Strona wizytówka (one page)**, od 690 zł netto. Wystarczy na start, razem z wizytówką Google.
- **Strona firmowa** z osobnymi podstronami usług, od 1 290 zł netto. Każda usługa to szansa na osobną frazę w Google, np. „usługa Słupsk”.
- **Landing page** pod kampanię reklamową, od 990 zł netto.
- **Sklep internetowy**, również z odbiorem osobistym dla lokalnych klientów, od 1 390 zł netto.

Pełna lista cen jest w [cenniku](/cennik).

## Co jest w standardzie

- Wersja na telefon i szybkie ładowanie (Core Web Vitals).
- Podstawowe SEO: tytuły, opisy, nagłówki, dane strukturalne firmy lokalnej, mapa strony.
- Dane firmy (nazwa, adres, telefon) spójne z wizytówką Google.
- Formularz kontaktowy i pomiar zapytań w Google Analytics.
- Domena i hosting na Ciebie. Strona jest Twoja.

## Masz już stronę?

Jeśli strona jest stara albo nie przynosi zapytań, zrobimy [audyt](/cennik) i powiemy, czy wystarczy ją poprawić, czy lepiej zbudować nową. Często wystarczą poprawki, a wtedy nie płacisz za całą stronę od nowa.`,
    faq: [
      'Czy mogę sam edytować stronę? | Tak. Treści, które zmieniasz najczęściej (ceny, aktualności, realizacje), edytujesz sam w panelu.',
      'Czy strona będzie widoczna w Google? | Każda strona ma podstawowe SEO techniczne. Na wysokie pozycje na konkurencyjne frazy potrzebne jest dalsze pozycjonowanie.',
    ],
  },
  {
    slug: 'pozycjonowanie-slupsk', city: 'Słupsk', service: 'pozycjonowanie-seo', order: 30, published: true,
    h1: 'Pozycjonowanie stron w Słupsku',
    lead: 'SEO lokalne dla firm ze Słupska: strona, wizytówka Google i treści ustawione tak, żeby pokazywać się na frazy z nazwą miasta i w Mapach Google.',
    seo_title: 'Pozycjonowanie Słupsk — SEO lokalne i wizytówka',
    seo_description: 'Pozycjonowanie stron dla firm ze Słupska: audyt SEO, SEO lokalne, wizytówka Google, treści i raporty. Audyt od 690 zł netto.',
    body: `## SEO lokalne to dwie rzeczy naraz

Na zapytanie „usługa + Słupsk” Google pokazuje dwa rodzaje wyników: **mapę z kilkoma firmami** (z wizytówek Google) i **zwykłe wyniki stron**. Pracujemy nad obydwoma, bo klient klika w to, co zobaczy najpierw.

## Co robimy

- **Audyt SEO** strony i konkurencji ze Słupska, od 690 zł netto.
- **Optymalizacja wizytówki Google**: kategorie, usługi, zdjęcia, opinie, posty.
- **Podstrony pod usługi i miejscowości**, np. osobna strona dla usługi w Słupsku i w Ustce, każda z unikalną treścią.
- **SEO techniczne**: szybkość, mapa strony, dane strukturalne, poprawne adresy kanoniczne.
- **Treści i linki**: poradniki na blogu, lokalne katalogi firm, współprace z firmami z regionu.
- **Raport co miesiąc**: wykonane prace i dane z Google Search Console.

## Czego nie obiecujemy

Nikt uczciwy nie zagwarantuje „pierwszego miejsca w Google”. Wyniki zależą od wyszukiwarki i konkurencji. Gwarantujemy zakres prac, jasne raporty i to, że wszystkie konta (Search Console, Analytics, wizytówka) są Twoje.

## Ile to kosztuje

Jednorazowe SEO lokalne na start kosztuje od 990 zł netto, a stały abonament SEO od 990 zł netto miesięcznie. Szczegóły są w [cenniku](/cennik). Mała firma z mniej konkurencyjnej branży często zaczyna tylko od [wizytówki Google](/uslugi/wizytowka-google) i poprawek na stronie.`,
    faq: [
      'Po jakim czasie widać efekty SEO? | Pierwsze zmiany zwykle po kilku miesiącach. W SEO lokalnym (wizytówka) bywa szybciej, zwłaszcza w mniej konkurencyjnych branżach.',
      'Czy muszę mieć nową stronę? | Nie zawsze. Często wystarczy poprawić istniejącą, co sprawdzimy w audycie.',
    ],
  },
  {
    slug: 'agencja-marketingowa-ustka', city: 'Ustka', service: '', order: 40, published: true,
    h1: 'Marketing dla firm z Ustki',
    lead: 'Pensjonaty, apartamenty, restauracje i atrakcje w Ustce walczą o turystów w krótkim sezonie. Pomagamy być widocznym wtedy, gdy goście planują wyjazd, a potem, gdy szukają czegoś na miejscu.',
    seo_title: 'Agencja marketingowa Ustka — marketing dla turystyki',
    seo_description: 'Marketing dla firm z Ustki: strony z rezerwacją, wizytówki Google, Instagram i reklamy przed sezonem. Agencja ze Słupska, kilkanaście minut od Ustki.',
    body: `## Turystyka rządzi się swoimi prawami

W nadmorskiej miejscowości większość klientów to turyści, którzy szukają noclegu tygodnie przed wyjazdem, a restauracji czy atrakcji, gdy już są na miejscu. Dlatego marketing dla firm z Ustki ma dwa momenty:

1. **Przed sezonem.** Kampanie i treści, które docierają do osób planujących urlop nad morzem, także z innych regionów Polski.
2. **W sezonie.** Wizytówka Google i Instagram, bo turysta na deptaku wpisuje w telefonie „restauracja w pobliżu” albo „co robić w Ustce”.

## Co najczęściej robimy dla firm z Ustki

- **Strona z rezerwacją lub zapytaniem o termin** dla pensjonatów i apartamentów. Dzięki temu część gości rezerwuje bezpośrednio, bez prowizji portali.
- **[Wizytówka Google](/uslugi/wizytowka-google)** ze zdjęciami, menu lub cennikiem, godzinami sezonowymi i odpowiedziami na opinie.
- **[Social media](/uslugi/social-media)**: zdjęcia i rolki z miejsca, które przyciągają gości bardziej niż opis.
- **Reklamy Meta i Google** uruchamiane przed sezonem i wyłączane po nim, żeby nie płacić za puste miesiące.
- **Wersja strony po niemiecku lub angielsku**, jeśli przyjmujesz gości z zagranicy.

## Poza sezonem

Zima to najlepszy czas na nową stronę, zdjęcia i przygotowanie kampanii. Wtedy w maju wszystko działa, zamiast powstawać w pośpiechu.

Jesteśmy ze Słupska, kilkanaście minut od Ustki, więc łatwo umówić się na spotkanie albo sesję zdjęciową na miejscu. Ceny „od” są w [cenniku](/cennik).`,
    faq: [
      'Czy pomagacie z rezerwacjami bezpośrednimi? | Tak. Robimy strony z formularzem zapytania o termin lub z systemem rezerwacji oraz kampanie kierujące na stronę, a nie na portal.',
      'Kiedy zacząć przygotowania do sezonu? | Najlepiej zimą lub wczesną wiosną. Kampanie na noclegi warto uruchamiać, zanim turyści zaczną planować urlop.',
    ],
  },
  {
    slug: 'agencja-marketingowa-lebork', city: 'Lębork', service: '', order: 50, published: true,
    h1: 'Marketing i strony internetowe dla firm z Lęborka',
    lead: 'Firmy z Lęborka konkurują o klientów nie tylko lokalnie, ale też z firmami z Trójmiasta. Pomagamy wyróżnić się w Google, w Mapach i w social mediach.',
    seo_title: 'Agencja marketingowa Lębork — strony, SEO, reklamy',
    seo_description: 'Strony internetowe, wizytówki Google, SEO i reklamy dla firm z Lęborka i okolic. Bez minimum zamówienia, spotkania na miejscu.',
    body: `## Między Słupskiem a Trójmiastem

Lębork leży między dwoma większymi rynkami, więc klienci często porównują lokalne firmy z ofertami z Gdyni czy Słupska. Wygrywa firma, która jest **łatwa do znalezienia i budzi zaufanie**: ma aktualną wizytówkę z opiniami, czytelną stronę z cenami „od” i pokazuje swoje realizacje.

## Co proponujemy firmom z Lęborka

- **[Wizytówka Google](/uslugi/wizytowka-google)** ustawiona na Lębork i okoliczne gminy (np. Nowa Wieś Lęborska, Cewice, Wicko), z usługami i zdjęciami.
- **[Strona internetowa](/uslugi/strony-internetowe)** z podstronami usług. Dla firm, które obsługują też Trójmiasto, osobne podstrony dla każdego obszaru.
- **[Reklamy Google](/uslugi/reklamy-platne)** na frazy z nazwą miasta, z wykluczeniem miejscowości, w których nie działasz.
- **[Social media](/uslugi/social-media)** pokazujące zespół i realizacje. Lokalnie ludzie kupują od ludzi, których znają.

## Jak zacząć przy małym budżecie

Nie ma minimum zamówienia. Dobry start to wizytówka Google i prosta strona wizytówka, a potem, gdy pojawią się zapytania, kampanie i SEO. Ceny są w [cenniku](/cennik).

Działamy ze Słupska i dojeżdżamy do Lęborka na spotkania. Większość spraw załatwimy też zdalnie, a postęp prac widzisz w panelu klienta.`,
    faq: [
      'Czy dojeżdżacie do Lęborka? | Tak, na spotkania i sesje zdjęciowe. Bieżącą współpracę prowadzimy też zdalnie.',
      'Czy warto reklamować się na Trójmiasto? | Jeśli tam dojeżdżasz, tak, ale z osobnymi podstronami i budżetem, żeby widzieć, który obszar się opłaca.',
    ],
  },
  {
    slug: 'agencja-marketingowa-bytow', city: 'Bytów', service: '', order: 60, published: true,
    h1: 'Marketing dla firm z Bytowa i Kaszub',
    lead: 'Agroturystyki, ośrodki nad jeziorami, zakłady produkcyjne i firmy usługowe z Bytowa i okolic. Robimy strony, wizytówki Google, SEO i kampanie, które docierają do właściwych klientów.',
    seo_title: 'Agencja marketingowa Bytów — strony, Google, reklamy',
    seo_description: 'Marketing dla firm z Bytowa i Kaszub: strony internetowe, wizytówki Google, SEO, reklamy i social media. Turystyka, produkcja i usługi.',
    body: `## Dwa rodzaje klientów

Firmy z Bytowa i okolic zwykle mają jedną z dwóch grup klientów, a marketing dla każdej wygląda inaczej:

- **Turyści i goście** szukający noclegu, agroturystyki czy atrakcji na Kaszubach. Szukają z wyprzedzeniem, porównują zdjęcia i opinie.
- **Klienci lokalni i firmy** z powiatu bytowskiego, którzy szukają usługi blisko, np. budowlanej, motoryzacyjnej czy remontowej, albo dostawcy dla swojej firmy.

## Dla turystyki

- Strona z galerią, cennikiem i formularzem zapytania o termin, żeby goście rezerwowali bezpośrednio.
- [Wizytówka Google](/uslugi/wizytowka-google) z aktualnymi zdjęciami okolicy i sezonowymi godzinami.
- Instagram i rolki pokazujące jeziora, lasy i atmosferę miejsca.
- Kampanie Meta przed sezonem kierowane do mieszkańców dużych miast.

## Dla produkcji i usług B2B

- [Strona firmowa](/uslugi/strony-internetowe) z ofertą dla firm, certyfikatami i realizacjami.
- [Pozyskiwanie leadów B2B](/uslugi/strategia-i-leady) i kampanie na LinkedIn lub w Google.
- [Strona kariery i kampanie rekrutacyjne](/uslugi/employer-branding), jeśli brakuje pracowników.

## Bez minimum zamówienia

Każdą usługę możesz zamówić osobno, a ceny „od” są w [cenniku](/cennik). Działamy ze Słupska, do Bytowa przyjedziemy na spotkanie albo sesję zdjęciową.`,
    faq: [
      'Czy robicie strony dla agroturystyk? | Tak, z galerią, cennikiem sezonowym i formularzem zapytania o termin lub systemem rezerwacji.',
      'Czy przyjedziecie zrobić zdjęcia? | Tak, sesję zdjęciową lub wideo na potrzeby strony i social mediów wyceniamy osobno.',
    ],
  },
  {
    slug: 'agencja-marketingowa-miastko', city: 'Miastko', service: '', order: 70, published: true,
    h1: 'Marketing internetowy dla firm z Miastka',
    lead: 'W mniejszym mieście wystarczy kilka dobrze zrobionych rzeczy, żeby być pierwszym wyborem w okolicy. Pomagamy firmom z Miastka zacząć od tego, co daje telefony, bez dużych budżetów.',
    seo_title: 'Marketing Miastko — wizytówka Google, strona, reklamy',
    seo_description: 'Marketing dla firm z Miastka i okolic: wizytówka Google, prosta strona internetowa, Facebook i lokalne reklamy. Małe zlecenia bez minimum.',
    body: `## Mała konkurencja w internecie to szansa

W wielu branżach w Miastku i okolicznych gminach niewiele firm ma porządną wizytówkę Google i aktualną stronę. Firma, która zadba o to pierwsza, często na długo zostaje na górze wyników, bo w Mapach Google pokazuje się tylko kilka firm.

## Plan na start dla firmy z Miastka

1. **[Wizytówka Google](/uslugi/wizytowka-google)** z obszarem działania obejmującym Miastko i okoliczne miejscowości, z usługami, zdjęciami i numerem telefonu, od 299 zł netto.
2. **Profil na Facebooku**, uporządkowany i regularnie uzupełniany, bo w mniejszych miejscowościach to wciąż ważne źródło informacji o lokalnych firmach.
3. **Prosta strona wizytówka**, od 690 zł netto, z cenami „od” i przyciskiem „Zadzwoń”.
4. **Lokalna reklama na Facebooku** z małym budżetem, kierowana tylko na okolicę, gdy chcesz szybko pozyskać klientów lub ogłosić nową usługę.

## Także dla firm, które obsługują większy teren

Jeśli dojeżdżasz do klientów w całym powiecie albo dalej, np. do Bytowa, Szczecinka czy Słupska, przygotujemy osobne podstrony dla tych miejscowości i ustawimy wizytówkę z szerszym obszarem działania.

Każdą usługę możesz zamówić osobno, bez pakietu, a ceny są w [cenniku](/cennik). Działamy ze Słupska, a większość spraw załatwiamy telefonicznie i online.`,
    faq: [
      'Czy wystarczy sama wizytówka Google? | Na start często tak, zwłaszcza w mniej konkurencyjnej branży. Strona pomaga, gdy klienci chcą zobaczyć ofertę, realizacje i ceny.',
      'Ile kosztuje reklama na Facebooku w małym mieście? | Budżet reklamowy ustalasz sam i płacisz go bezpośrednio Meta. Konfiguracja kampanii u nas kosztuje od 790 zł netto.',
    ],
  },
];

// ---------------------------------------------------------------------
// Branże — strony /branze/<adres>
// ---------------------------------------------------------------------
const industries = [
  {
    slug: 'budowlanka-i-remonty', name: 'Marketing dla firm budowlanych i remontowych', short: 'Wykonawcy, instalatorzy, ekipy remontowe', icon: 'building-2', order: 10, published: true,
    lead: 'Klient szuka wykonawcy raz na kilka lat i najpierw sprawdza zdjęcia realizacji oraz opinie. Pomagamy pokazać, że Twoim ekipom można powierzyć dom albo firmę.',
    seo_title: 'Marketing dla firm budowlanych i remontowych | VELIO',
    seo_description: 'Strona z realizacjami, wizytówka Google i reklamy lokalne dla firm budowlanych i remontowych. Więcej zapytań o konkretne prace, bez minimum zamówienia.',
    services: ['strony-internetowe', 'wizytowka-google', 'reklamy-platne', 'pozycjonowanie-seo'], package: 'lokalny-start', plan: 'widocznosc-lokalna',
    body: `## Co decyduje o wyborze wykonawcy
Inwestor rzadko wybiera po samej cenie. Chce wiedzieć, czy robisz taki zakres, czy dojedziesz do jego miejscowości i czy ktoś był zadowolony. Te trzy odpowiedzi powinny być widoczne w minutę, także na telefonie.

## Od czego zacząć
- **Osobne podstrony prac**, np. dachy, elewacje, łazienki. Każda z nich może odpowiadać na inne zapytanie w Google.
- **Realizacje ze zdjęciami przed i po**, z miejscowością i krótkim opisem zakresu.
- **Wizytówka Google z obszarem działania**, jeśli dojeżdżasz do klientów i nie przyjmujesz ich w biurze.
- **Formularz ze zdjęciami**, który od razu daje podstawę do wstępnej wyceny.

## Kiedy dokładać reklamy
Reklamy mają sens, gdy masz wolne terminy i wiesz, ile zarabiasz na zleceniu. Kierujemy je na konkretne prace i miejscowości, a wyłączamy, gdy kalendarz jest pełny. Budżet możesz sprawdzić w [kalkulatorze reklam](/narzedzia/kalkulator-budzetu-reklam).`,
    faq: ['Czy potrzebuję strony, skoro mam Facebooka? | Facebook pomaga, ale strona daje osobne podstrony usług, które mogą pojawiać się w Google na konkretne zapytania.', 'Co jeśli nie mam zdjęć realizacji? | Zacznij od telefonu na najbliższych zleceniach. Podpowiemy, co fotografować, a przy większych projektach możemy umówić sesję.'],
  },
  {
    slug: 'gastronomia', name: 'Marketing dla restauracji i gastronomii', short: 'Restauracje, kawiarnie, catering', icon: 'star', order: 20, published: true,
    lead: 'Gość decyduje na telefonie, często kilka minut przed wyjściem. Aktualne menu, godziny i dobre zdjęcia w Google dają więcej niż rozbudowana strona.',
    seo_title: 'Marketing dla restauracji i gastronomii | VELIO',
    seo_description: 'Wizytówka Google, menu online, Instagram i reklamy lokalne dla restauracji, kawiarni i cateringu. Więcej gości z okolicy i turystów w sezonie.',
    services: ['wizytowka-google', 'social-media', 'strony-internetowe', 'reklamy-platne'], package: 'lokalny-start', plan: 'widocznosc-lokalna',
    body: `## Pierwsze wrażenie powstaje w Mapach Google
Wyszukiwanie „restauracja w pobliżu” kończy się zwykle wyborem spośród kilku firm z mapy. Liczą się ocena, świeże zdjęcia dań, godziny otwarcia i to, czy menu da się przeczytać na telefonie.

## Co robimy najczęściej
- **Wizytówka Google** z aktualnym menu, zdjęciami i godzinami świątecznymi oraz sezonowymi.
- **Prosta strona z menu**, która działa szybko na telefonie. Bez plików PDF do pobierania.
- **Instagram i rolki** pokazujące dania, zespół i wydarzenia.
- **Lokalne kampanie** na lunch, wydarzenia i catering firmowy.

## Sezon i poza sezonem
Nad morzem marketing ma dwa rytmy: w sezonie dociera do turystów na miejscu, a poza nim buduje grupę stałych gości. Pomagamy zaplanować oba, żeby budżet nie szedł na puste miesiące.`,
    faq: ['Czy menu w PDF wystarczy? | Działa, ale na telefonie czyta się je gorzej i trudniej je aktualizować. Menu jako zwykła podstrona jest wygodniejsze dla gości.', 'Jak odpowiadać na złe opinie? | Rzeczowo, bez emocji i z propozycją rozwiązania. Odpowiedź czytają też przyszli goście, nie tylko autor opinii.'],
  },
  {
    slug: 'noclegi-i-turystyka', name: 'Marketing dla noclegów i turystyki', short: 'Pensjonaty, apartamenty, agroturystyki, atrakcje', icon: 'sun', order: 30, published: true,
    lead: 'Goście planują wyjazd tygodnie wcześniej i porównują zdjęcia, opinie oraz ceny. Pomagamy zdobywać więcej rezerwacji bezpośrednich, bez prowizji portali.',
    seo_title: 'Marketing dla noclegów i turystyki | VELIO',
    seo_description: 'Strona z rezerwacją bezpośrednią, wizytówka Google i kampanie przed sezonem dla pensjonatów, apartamentów i agroturystyk z Pomorza.',
    services: ['strony-internetowe', 'wizytowka-google', 'social-media', 'reklamy-platne'], package: 'sezon', plan: 'marketing-lokalny',
    body: `## Portal przyprowadza gościa, strona go zatrzymuje
Portale rezerwacyjne dają zasięg, ale pobierają prowizję. Własna strona nie musi ich zastąpić. Wystarczy, że powracający gość i osoba, która znalazła Cię w Google, mogą zarezerwować bezpośrednio.

## Czego potrzebuje strona obiektu
- **Duże, prawdziwe zdjęcia** pokoi, widoku i okolicy.
- **Czytelny cennik sezonowy** oraz zasady pobytu.
- **Zapytanie o termin albo rezerwacja online**, działające na telefonie.
- **Wersja obcojęzyczna**, jeśli przyjmujesz gości z zagranicy.

## Kalendarz działań
1. **Zima:** strona, zdjęcia i oferta na nowy sezon.
2. **Wczesna wiosna:** pierwsze kampanie do osób planujących urlop.
3. **Sezon:** wizytówka, opinie i publikacje z miejsca.
4. **Po sezonie:** oferta dla stałych gości i weekendy poza sezonem.

Szczegóły znajdziesz w [pakiecie SEZON](/pakiety#pakiet-sezon).`,
    faq: ['Czy muszę rezygnować z portali rezerwacyjnych? | Nie. Większość obiektów korzysta z obu kanałów. Celem jest zwiększenie udziału rezerwacji bez prowizji.', 'Kiedy zacząć przygotowania do sezonu? | Najlepiej zimą lub wczesną wiosną, zanim goście zaczną planować urlop.'],
  },
  {
    slug: 'transport-i-przeprowadzki', name: 'Marketing i panel dla firm transportowych', short: 'Przeprowadzki, transport, wywóz, usługi w terenie', icon: 'rocket', order: 40, published: true,
    lead: 'W tej branży wygrywa ten, kto odpowie pierwszy i szybko poda cenę. Wycena krok po kroku i panel do zleceń porządkują pracę od zapytania po rozliczenie.',
    seo_title: 'Marketing i panel dla firm transportowych | VELIO',
    seo_description: 'Strona z wyceną online, lokalne SEO i panel do zleceń dla firm przeprowadzkowych i transportowych. Zobacz realizację dla firmy ze Słupska.',
    services: ['strony-internetowe', 'pozycjonowanie-seo', 'ai-i-automatyzacje', 'wizytowka-google'], package: 'panel-firmy', plan: 'asystent-zapytan',
    body: `## Zapytanie jest warte tyle, ile czas odpowiedzi
Klient, który potrzebuje przeprowadzki albo wywozu, pyta zwykle kilka firm naraz. Formularz z pytaniami o trasę, piętro i zdjęciami skraca wymianę wiadomości, a powiadomienie na telefon pozwala odpowiedzieć przed konkurencją.

## Co można uporządkować
- **Wycena krok po kroku** na stronie, z możliwością dodania zdjęć.
- **Podstrony miejscowości**, jeśli obsługujesz większy teren. Każda z unikalną treścią.
- **Panel zleceń**: statusy, klienci, koszty, pojazdy i pracownicy.
- **Automatyczna prośba o opinię** po zakończonym zleceniu.

## Przykład z naszej pracy
Podobny system zbudowaliśmy dla firmy ze Słupska. Opis znajdziesz w [realizacji RevSerwis](/realizacje/revserwis-strona-i-panel).`,
    faq: ['Czy panel zadziała na telefonie kierowcy? | Tak, projektujemy go jako aplikację webową, którą można dodać do ekranu telefonu.', 'Czy muszę od razu budować panel? | Nie. Zwykle zaczynamy od strony i formularza. Panel ma sens, gdy zleceń jest tyle, że notatki przestają wystarczać.'],
  },
  {
    slug: 'uslugi-lokalne', name: 'Marketing dla lokalnych firm usługowych', short: 'Salony, warsztaty, gabinety, firmy sprzątające', icon: 'map-pin', order: 50, published: true,
    lead: 'Salon, warsztat, gabinet czy firma sprzątająca nie potrzebują ogromnego budżetu. Potrzebują kompletnej wizytówki, opinii i prostej drogi do kontaktu.',
    seo_title: 'Marketing dla lokalnych firm usługowych | VELIO',
    seo_description: 'Wizytówka Google, opinie, prosta strona i lokalne reklamy dla salonów, warsztatów, gabinetów i firm usługowych. Małe zlecenia bez minimum.',
    services: ['wizytowka-google', 'strony-internetowe', 'social-media', 'reklamy-platne'], package: 'lokalny-start', plan: 'widocznosc-lokalna',
    body: `## Mały budżet, konkretna kolejność
Najpierw to, co działa bez opłat za kliknięcia, a dopiero potem reklamy. Taka kolejność sprawia, że każda złotówka z kampanii trafia na profil, który przekonuje do kontaktu.

1. **Wizytówka Google** kompletna i spójna ze stroną. Sprawdź ją w naszym [teście wizytówki](/narzedzia/test-wizytowki-google).
2. **System zbierania opinii**: prośba z bezpośrednim linkiem po każdej usłudze, skierowana do wszystkich klientów.
3. **Prosta strona** z cennikiem „od”, zdjęciami i przyciskiem „Zadzwoń”.
4. **Lokalna kampania** na okres, w którym masz wolne terminy.

## Branże z ograniczeniami
Część usług, m.in. medycznych, podlega dodatkowym ograniczeniom w reklamie. Treści i kampanie ustalamy tak, aby uwzględniały zasady platform i przepisy dotyczące Twojej branży.`,
    faq: ['Ile opinii potrzebuję? | Nie ma magicznej liczby. Liczą się regularność i to, jak wypadasz na tle firm z okolicy.', 'Czy mogę zamówić tylko wizytówkę? | Tak. Każdą usługę zamówisz osobno, bez pakietu.'],
  },
];

// ---------------------------------------------------------------------
// Dodatki do istniejącej bazy
// ---------------------------------------------------------------------
const price_items_v2 = [
  item('wizytowka-google', 'Abonament Widoczność lokalna', 449, 'netto / mies.', 'Wizytówka, opinie, spójne dane w katalogach, drobne SEO i raport co miesiąc.'),
  item('strony-internetowe', 'Opieka nad stroną PLUS', 349, 'netto / mies.', 'Opieka techniczna i 2 godziny zmian na stronie w każdym miesiącu.'),
  item('ai-i-automatyzacje', 'Asystent zapytań', 399, 'netto / mies.', 'Automatyczne odpowiedzi, przypomnienia i prośby o opinię, wraz z utrzymaniem.'),
  item('ai-i-automatyzacje', 'Panel dla firmy usługowej', 1200, 'netto', 'Zlecenia, klienci, finanse i konta pracowników. Zakres ustalamy po analizie procesu.'),
  item('strategia-i-leady', 'System zbierania opinii Google', 390, 'netto', 'Link i kod QR do opinii, szablony wiadomości i instrukcja dla zespołu.'),
];

const POST_META = { author: AUTHOR, published: true };
const posts_v2 = [
  {
    ...POST_META, slug: 'jak-zbierac-opinie-google', title: 'Jak zbierać opinie Google, nie łamiąc zasad', category: 'Marketing lokalny', published_at: '2026-11-04',
    excerpt: 'Prosty system proszenia o opinie: kiedy pytać, co napisać, jak odpowiadać i czego nie robić, żeby nie stracić opinii ani nie narazić profilu.',
    seo_title: 'Jak zbierać opinie Google? Prosty system', seo_description: 'Kiedy prosić o opinię, jak wysłać bezpośredni link, jak odpowiadać na negatywne oceny i jakich praktyk Google zakazuje. Poradnik dla firm lokalnych.',
    services: ['wizytowka-google', 'pozycjonowanie-seo'],
    body: `Opinie wpływają na to, czy klient zadzwoni do Ciebie, czy do firmy obok. Większość zadowolonych klientów nie wystawi jednak oceny sama z siebie. Potrzebny jest prosty, powtarzalny sposób proszenia o nią.

## Kiedy prosić o opinię

Najlepiej tuż po zakończeniu usługi, gdy klient pamięta współpracę. Prośba wysłana miesiąc później zwykle zostaje bez odpowiedzi. Ustal jeden moment w procesie, np. dzień po odbiorze prac albo przy wysłaniu faktury.

## Jak ułatwić wystawienie opinii

W panelu Profilu Firmy w Google skopiuj link do wystawiania opinii. Wyślij go SMS-em lub e-mailem, a w lokalu pokaż jako kod QR.

> Dzień dobry, dziękujemy za współpracę. Jeśli ma Pan/Pani minutę, będziemy wdzięczni za opinię o naszej pracy: [link]. To dla nas duża pomoc.

## Czego nie robić

- **Nie kupuj opinii** i nie publikuj ich w imieniu klientów.
- **Nie oferuj rabatów ani nagród** w zamian za opinię.
- **Nie proś wyłącznie zadowolonych klientów.** Selekcjonowanie, kogo poprosić, jest niezgodne z zasadami Google.
- **Nie proś o wszystkie opinie jednego dnia.** Zbieraj je regularnie.

## Jak odpowiadać

Odpowiadaj na każdą opinię. Pozytywną skwituj krótkim, konkretnym podziękowaniem. Na negatywną odpisz spokojnie, odnieś się do sprawy i zaproponuj kontakt. Taką odpowiedź czytają przyszli klienci. Opinię łamiącą zasady możesz zgłosić do Google, ale usunięcie nie jest gwarantowane.

## Ustaw to raz

Dobrze działa prosta zasada: po każdym zleceniu jedna wiadomość z linkiem, a raz w tygodniu odpowiedzi na nowe opinie. Sprawdź też, co jeszcze warto poprawić, w [teście wizytówki Google](/narzedzia/test-wizytowki-google). Jeśli wolisz to oddać, zajmiemy się tym w abonamencie [Widoczność lokalna](/abonamenty#widocznosc-lokalna).`,
  },
  {
    ...POST_META, slug: 'google-ads-czy-facebook-ads', title: 'Google Ads czy Facebook Ads? Jak wybrać dla małej firmy', category: 'Reklamy Google i Meta', published_at: '2026-11-18',
    excerpt: 'Google odpowiada na istniejącą potrzebę, a Meta ją buduje. Sprawdź, który kanał wybrać na start i jak zrobić uczciwy test przy małym budżecie.',
    seo_title: 'Google Ads czy Facebook Ads? Co wybrać', seo_description: 'Porównanie Google Ads i Meta Ads dla małej firmy: kiedy który kanał ma sens, jak ustawić budżet testowy i po czym ocenić wynik.',
    services: ['reklamy-platne', 'analityka-i-pomiar'],
    body: `Najlepszego kanału nie wybiera się po popularności, tylko po tym, jak klient szuka Twojej usługi. Oba systemy działają inaczej.

## Różnica w jednym zdaniu

**Google Ads** pokazuje reklamę osobie, która właśnie czegoś szuka. **Meta Ads** (Facebook i Instagram) pokazuje ją osobie, która może być zainteresowana, choć w tej chwili nie szuka.

| | Google Ads | Meta Ads |
| --- | --- | --- |
| Intencja | Klient już szuka | Trzeba wzbudzić zainteresowanie |
| Dobre dla | Pilnych i konkretnych usług | Oferty, którą dobrze widać na zdjęciu lub wideo |
| Kluczowy element | Słowa kluczowe i strona | Kreacja i odbiorcy |
| Przykłady | Hydraulik, serwis, wynajem | Restauracja, salon, nocleg, wydarzenie |

## Co wybrać na start

- **Klienci sami szukają usługi w Google?** Zacznij od Google Ads.
- **Usługa dobrze wygląda na zdjęciach albo klient musi ją dopiero odkryć?** Zacznij od Meta Ads.
- **Masz mały budżet?** Wybierz jeden kanał. Podzielony budżet często nie daje wniosków w żadnym.

## Jak zrobić uczciwy test

1. Ustal cel: telefon, formularz albo rezerwacja.
2. Włącz pomiar, zanim wydasz pierwszą złotówkę.
3. Policz, ile możesz zapłacić za klienta. Pomoże w tym [kalkulator budżetu reklam](/narzedzia/kalkulator-budzetu-reklam).
4. Zostaw kampanię na tyle długo, by zebrać dane. Nie oceniaj jej po dwóch dniach.
5. Porównuj koszt zapytania i klienta, a nie kliknięcia czy polubienia.

## Sama reklama nie wystarczy

Reklama przyprowadza ludzi na stronę lub profil. Jeśli strona działa wolno, nie ma cen ani prostego kontaktu, wynik będzie słaby w każdym systemie. Pomożemy to [ocenić i ustawić](/uslugi/reklamy-platne).`,
  },
  {
    ...POST_META, slug: 'ile-kosztuje-pozycjonowanie-lokalne', title: 'Ile kosztuje pozycjonowanie lokalne i co dostajesz w cenie', category: 'SEO', published_at: '2026-12-02',
    excerpt: 'Co składa się na cenę SEO lokalnego, kiedy wystarczy jednorazowa optymalizacja, a kiedy abonament, i jakich obietnic lepiej się wystrzegać.',
    seo_title: 'Ile kosztuje pozycjonowanie lokalne?', seo_description: 'Koszt SEO lokalnego: audyt, optymalizacja i abonament. Co powinno być w cenie, ile trwa zanim zobaczysz efekty i jak rozpoznać złą ofertę.',
    services: ['pozycjonowanie-seo', 'wizytowka-google'],
    body: `Pytanie o cenę SEO nie ma jednej odpowiedzi, bo inny zakres potrzebny jest hydraulikowi w małym mieście, a inny klinice w dużym. Można jednak sprawdzić, za co dokładnie płacisz.

## Z czego składa się SEO lokalne

- **Audyt:** co dziś blokuje stronę i jak wypadasz na tle konkurencji.
- **Technika:** szybkość, wersja mobilna, adresy i dane strukturalne.
- **Treści:** osobne podstrony usług i miejscowości z unikalną treścią.
- **Wizytówka Google:** kategorie, usługi, zdjęcia i opinie.
- **Linki i wzmianki:** lokalne katalogi oraz współprace.
- **Raport:** wykonane prace i dane, które możesz sprawdzić sam.

## Jednorazowo czy w abonamencie

| Sytuacja | Co zwykle wystarczy | Cena w VELIO (netto) |
| --- | --- | --- |
| Chcesz wiedzieć, co poprawić | Audyt SEO | od 690 zł |
| Mała konkurencja w okolicy | SEO lokalne na start | od 990 zł |
| Wizytówka i opinie co miesiąc | Widoczność lokalna | od 449 zł / mies. |
| Konkurencyjna branża lub większy obszar | Abonament SEO | od 990 zł / mies. |

Aktualne ceny znajdziesz w [cenniku](/cennik).

## Ile czeka się na efekty

Pierwsze zmiany pojawiają się zwykle po kilku miesiącach. W mniej konkurencyjnych branżach wizytówka może zacząć działać szybciej. Czas zależy od stanu strony, konkurencji i regularności prac.

## Sygnały ostrzegawcze

- gwarancja pierwszego miejsca w Google,
- brak informacji, jakie prace są wykonywane,
- konta i dane, do których nie masz dostępu,
- raporty bez źródła danych,
- setki podstron różniących się tylko nazwą miasta.

## Od czego zacząć

Jeśli nie masz pewności, zacznij od [audytu](/uslugi/pozycjonowanie-seo). Dowiesz się, czy wystarczą poprawki, czy potrzebna jest dłuższa praca.`,
  },
  {
    ...POST_META, slug: 'rezerwacje-bezposrednie-strona-pensjonatu', title: 'Rezerwacje bezpośrednie: jak strona pensjonatu ogranicza prowizje', category: 'Strony WWW', published_at: '2026-12-16',
    excerpt: 'Co powinna mieć strona obiektu, żeby gość rezerwował bezpośrednio, i jak przygotować ją zimą, zanim zacznie się planowanie urlopów.',
    seo_title: 'Rezerwacje bezpośrednie: strona pensjonatu', seo_description: 'Jak strona pensjonatu lub apartamentu zwiększa liczbę rezerwacji bez prowizji: zdjęcia, cennik, formularz, opinie i kalendarz przygotowań przed sezonem.',
    services: ['strony-internetowe', 'wizytowka-google', 'reklamy-platne'],
    body: `Portale rezerwacyjne dają zasięg, a to duża wartość, ale każda rezerwacja kosztuje prowizję. Celem własnej strony nie jest walka z portalami. Chodzi o to, aby gość, który już Cię znalazł, mógł łatwo zarezerwować bezpośrednio.

## Skąd biorą się rezerwacje bezpośrednie

- **Powracający goście**, którzy chcą wrócić i szukają kontaktu do obiektu.
- **Osoby sprawdzające Cię w Google** po zobaczeniu oferty na portalu.
- **Wizytówka Google**, z której gość przechodzi na stronę.
- **Kampanie przed sezonem** kierujące prosto na Twoją stronę.

## Co musi mieć strona obiektu

1. **Prawdziwe, duże zdjęcia.** To one sprzedają pokój.
2. **Czytelny cennik sezonowy** i zasady pobytu.
3. **Formularz zapytania o termin lub system rezerwacji** działający na telefonie.
4. **Powód, by rezerwować bezpośrednio**, np. bezpośredni kontakt z gospodarzem albo elastyczniejsze warunki. Sprawdź wcześniej, czy Twoja umowa z portalem nie ogranicza takich ofert.
5. **Opinie i informacje o okolicy:** dojazd, plaża, atrakcje.

## Formularz czy system rezerwacji

Mały obiekt może zacząć od zapytania o termin, o ile szybko na nie odpowiada. System rezerwacji online przydaje się, gdy pokoi jest więcej i trzeba synchronizować kalendarze z portalami, aby uniknąć podwójnych rezerwacji.

## Kalendarz przygotowań

- **Zima:** strona, zdjęcia i oferta.
- **Wczesna wiosna:** uruchomienie kampanii i aktualizacja wizytówki.
- **Sezon:** szybkie odpowiedzi, opinie i publikacje.
- **Jesień:** kontakt ze stałymi gośćmi i oferta na kolejny rok.

Całość łączy [pakiet SEZON](/pakiety#pakiet-sezon). Więcej o branży przeczytasz na stronie [noclegi i turystyka](/branze/noclegi-i-turystyka).`,
  },
];

const locals_v2 = [
  {
    slug: 'strony-internetowe-ustka', city: 'Ustka', service: 'strony-internetowe', order: 45, published: true,
    h1: 'Strony internetowe dla firm z Ustki',
    lead: 'Strony dla pensjonatów, restauracji, wypożyczalni i atrakcji w Ustce. Działają szybko na telefonie turysty i pomagają zdobywać rezerwacje bez prowizji portali.',
    seo_title: 'Strony internetowe Ustka — noclegi i turystyka',
    seo_description: 'Strony internetowe dla firm z Ustki: pensjonaty, apartamenty, restauracje i atrakcje. Galeria, cennik sezonowy, zapytanie o termin. Od 690 zł netto.',
    body: `## Strona, którą turysta otworzy na telefonie

Gość planujący wyjazd do Ustki porównuje oferty na telefonie, często w przerwie w pracy lub na kanapie. Potrzebuje zdjęć, cen i prostego sposobu na zapytanie o termin. Jeśli strona ładuje się długo, wraca do wyników wyszukiwania.

## Co przygotowujemy dla firm z Ustki

- **Dla noclegów:** galeria, cennik sezonowy, dojazd, odległość od plaży i zapytanie o termin.
- **Dla gastronomii:** menu jako zwykła podstrona, godziny sezonowe i szybki kontakt.
- **Dla atrakcji i wypożyczalni:** oferta, ceny, dostępność i informacja, gdzie się spotkać.
- **Wersje językowe:** niemiecka lub angielska, jeśli przyjmujesz gości z zagranicy.

## Ile to kosztuje

Prosta strona wizytówka zaczyna się od 690 zł netto, a strona z podstronami od 1 290 zł netto. Gdy potrzebujesz też wizytówki i kampanii przed sezonem, sprawdź [pakiet SEZON](/pakiety#pakiet-sezon).

## Kiedy zacząć

Zimą jest czas na zdjęcia i spokojną pracę nad treścią. Wtedy strona jest gotowa, zanim goście zaczną planować urlop. Jesteśmy ze Słupska, więc łatwo umówić się w Ustce na spotkanie.`,
    faq: ['Czy zrobicie zdjęcia na miejscu? | Tak, sesję zdjęciową w Ustce wyceniamy osobno. Możesz też użyć własnych, dobrej jakości zdjęć.', 'Czy strona może mieć rezerwacje online? | Tak. Na start wystarczy często zapytanie o termin, a system rezerwacji dodajemy, gdy jest potrzebny.'],
  },
  {
    slug: 'pozycjonowanie-lebork', city: 'Lębork', service: 'pozycjonowanie-seo', order: 55, published: true,
    h1: 'Pozycjonowanie stron dla firm z Lęborka',
    lead: 'SEO lokalne dla firm z Lęborka i okolic. Pomagamy pokazywać się na zapytania z nazwą miasta, także wtedy, gdy klienci porównują Cię z ofertami z Trójmiasta.',
    seo_title: 'Pozycjonowanie Lębork — SEO lokalne dla firm',
    seo_description: 'SEO lokalne dla firm z Lęborka: audyt, podstrony usług, wizytówka Google i raport co miesiąc. Bez obietnic pierwszego miejsca. Audyt od 690 zł netto.',
    body: `## Dwa rynki w jednym wyszukiwaniu

Klient z Lęborka często porównuje lokalną firmę z ofertami z Gdyni czy Wejherowa. Twoją przewagą jest bliskość, ale musi być ona widoczna: adres lub obszar działania, lokalne realizacje i opinie klientów z okolicy.

## Co robimy dla firm z Lęborka

1. **Audyt** strony, wizytówki i konkurencji na frazach z nazwą miasta.
2. **Podstrony usług** z konkretnym opisem zakresu i obszaru.
3. **Wizytówka Google** z właściwymi kategoriami i okoliczną strefą działania.
4. **Lokalne wzmianki:** katalogi firm, współprace oraz lokalne media.
5. **Raport co miesiąc** z danymi z Google Search Console.

## Obsługujesz też Trójmiasto?

Jeśli dojeżdżasz do klientów w Trójmieście, przygotujemy osobną podstronę tylko wtedy, gdy masz tam realne realizacje lub ofertę. Sama zmiana nazwy miasta w tekście nie pomoże, a może zaszkodzić.

## Ceny

Audyt SEO kosztuje od 690 zł netto, a [abonament Widoczność lokalna](/abonamenty#widocznosc-lokalna) od 449 zł netto miesięcznie. Pełna lista jest w [cenniku](/cennik).`,
    faq: ['Czy gwarantujecie pierwsze miejsce? | Nie. Nikt nie kontroluje wyników Google. Gwarantujemy zakres prac i dane, które możesz sprawdzić.', 'Czy przyjeżdżacie do Lęborka? | Tak, na spotkania i sesje zdjęciowe. Bieżącą pracę prowadzimy też zdalnie.'],
  },
];

export const SEED = {
  price_items,
  posts,
  cases,
  reviews: [], // tylko prawdziwe opinie — dodasz je w panelu (np. z wizytówki Google)
  locals,
  industries,
};

// Nowe pozycje dla istniejącej bazy: dodawane raz, tylko gdy nie ma jeszcze pozycji o tym adresie lub nazwie.
// Ceny dopasowane do pakietów. Działająca baza dostaje je raz: tylko pozycje i fragmenty, których nikt nie zmienił.
export const PRICE_UPDATE = {
  items: [['Strona wizytówka (one page)', 990, 690], ['Landing page pod kampanię', 1490, 990], ['Strona firmowa (do 6 podstron)', 2490, 1290], ['Sklep internetowy', 4990, 1390], ['Prowadzenie kampanii', 690, 490]],
  text: {
    posts: {"ile-kosztuje-strona-internetowa":[["od ok. 1 000 zł","od ok. 700 zł"],["od ok. 1 500 zł","od ok. 1 000 zł"],["od ok. 2 500 zł","od ok. 1 300 zł"],["od ok. 5 000 zł","od ok. 1 400 zł"],["zaczyna się od 990 zł netto, landing page od 1 490 zł, a strona firmowa z kilkoma podstronami od 2 490 zł","zaczyna się od 690 zł netto, landing page od 990 zł, a strona firmowa z kilkoma podstronami od 1 290 zł"]]},
    locals: {"strony-internetowe-slupsk":[["od prostej wizytówki za 990 zł netto","od prostej wizytówki za 690 zł netto"],["Szybkie, pod SEO i telefony. Od 990 zł netto.","Szybkie, pod SEO i telefony. Od 690 zł netto."],["**Strona wizytówka (one page)**, od 990 zł netto","**Strona wizytówka (one page)**, od 690 zł netto"],["z osobnymi podstronami usług, od 2 490 zł netto","z osobnymi podstronami usług, od 1 290 zł netto"],["pod kampanię reklamową, od 1 490 zł netto","pod kampanię reklamową, od 990 zł netto"],["dla lokalnych klientów, od 4 990 zł netto","dla lokalnych klientów, od 1 390 zł netto"]],"agencja-marketingowa-miastko":[["**Prosta strona wizytówka**, od 990 zł netto","**Prosta strona wizytówka**, od 690 zł netto"]]},
  },
};

export const SEED_ADDITIONS = { price_items: price_items_v2, posts: posts_v2, locals: locals_v2 };
