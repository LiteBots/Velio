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
  item('strony-internetowe', 'Strona wizytówka (one page)', 990, 'netto', 'Jedna strona z ofertą, danymi kontaktowymi, mapą i formularzem. Dobra na start dla małej firmy.', { popular: true }),
  item('strony-internetowe', 'Landing page pod kampanię', 1490, 'netto', 'Strona sprzedażowa pod jedną usługę lub kampanię Google/Meta, z pomiarem konwersji.'),
  item('strony-internetowe', 'Strona firmowa (do 6 podstron)', 2490, 'netto', 'Strona główna, oferta, o nas, realizacje, kontakt i blog. Podstawowe SEO w cenie.'),
  item('strony-internetowe', 'Sklep internetowy', 4990, 'netto', 'Katalog produktów, koszyk, płatności i dostawy. Zakres zależy od liczby produktów i integracji.'),
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
  item('reklamy-platne', 'Prowadzenie kampanii', 690, 'netto / mies.', 'Optymalizacja, testy reklam, raport. Budżet płacisz bezpośrednio Google lub Meta.'),
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
| Strona wizytówka (one page) | Mała firma, start działalności | od ok. 1 000 zł |
| Landing page | Jedna usługa, kampania reklamowa | od ok. 1 500 zł |
| Strona firmowa (kilka podstron) | Firma usługowa, która chce pozycjonowania | od ok. 2 500 zł |
| Sklep internetowy | Sprzedaż online | od ok. 5 000 zł |
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

Nie mamy minimalnej kwoty zamówienia. Prosta strona wizytówka zaczyna się od 990 zł netto, landing page od 1 490 zł, a strona firmowa z kilkoma podstronami od 2 490 zł. Większe projekty wyceniamy po krótkiej rozmowie, z rozpisanym zakresem i kosztami zewnętrznymi. [Zamów bezpłatną wycenę](/wycena) albo zobacz, [jak robimy strony internetowe](/uslugi/strony-internetowe).`,
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
  {
    slug: 'psb-fimal-sklep-internetowy',
    title: 'PSB Fimal: sklep internetowy z odbiorem osobistym',
    client: 'PSB Fimal',
    industry: 'Materiały budowlane',
    city: '',
    url: '',
    summary: 'Sklep internetowy dla składu budowlanego z zamówieniem online i odbiorem osobistym oraz panelem administratora.',
    problem: 'Uzupełnij: punkt wyjścia klienta (WERSJA ROBOCZA — opublikuj po akceptacji klienta).',
    solution: `- Sklep internetowy z katalogiem produktów i zamówieniem z odbiorem osobistym.
- Panel administratora do zarządzania produktami i zamówieniami.
- Projekt w kolorach marki (biało-czerwony).`,
    results: [],
    services: ['strony-internetowe'],
    order: 20,
    published: false,
  },
  {
    slug: 'milkmi-zamowienia-online',
    title: 'MilkMi: zamówienia online',
    client: 'MilkMi',
    industry: 'Handel',
    city: '',
    url: '',
    summary: 'Sklep do zamówień online. Uzupełnij opis i wyniki przed publikacją.',
    problem: 'Uzupełnij (WERSJA ROBOCZA).',
    solution: '- Uzupełnij zakres prac.',
    results: [],
    services: ['strony-internetowe'],
    order: 30,
    published: false,
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
    lead: 'Projektujemy i wdrażamy strony dla firm ze Słupska: od prostej wizytówki za 990 zł netto po sklepy i serwisy z panelem klienta. Szybkie, przygotowane pod Google i telefon.',
    seo_title: 'Strony internetowe Słupsk — projekt i wdrożenie',
    seo_description: 'Tworzenie stron internetowych w Słupsku: wizytówki, strony firmowe, landing page i sklepy. Szybkie, pod SEO i telefony. Od 990 zł netto.',
    body: `## Strona, która ma zadanie

Klient ze Słupska, który szuka usługi, zwykle robi to na telefonie i porównuje 2–3 firmy. Wygrywa ta, której strona szybko się ładuje, od razu mówi, co i gdzie robi, i pozwala zadzwonić jednym kliknięciem. Tak projektujemy każdą stronę.

## Rodzaje stron, które robimy

- **Strona wizytówka (one page)**, od 990 zł netto. Wystarczy na start, razem z wizytówką Google.
- **Strona firmowa** z osobnymi podstronami usług, od 2 490 zł netto. Każda usługa to szansa na osobną frazę w Google, np. „usługa Słupsk”.
- **Landing page** pod kampanię reklamową, od 1 490 zł netto.
- **Sklep internetowy**, również z odbiorem osobistym dla lokalnych klientów, od 4 990 zł netto.

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
3. **Prosta strona wizytówka**, od 990 zł netto, z cenami „od” i przyciskiem „Zadzwoń”.
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

export const SEED = {
  price_items,
  posts,
  cases,
  reviews: [], // tylko prawdziwe opinie — dodasz je w panelu (np. z wizytówki Google)
  locals,
};
