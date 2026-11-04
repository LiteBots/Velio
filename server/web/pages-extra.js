// Podstrony: branże, jak pracujemy i darmowe narzędzia oraz nowe sekcje strony głównej.
import { config } from '../config.js';
import { packages, plans, service, servicePrice, planPrice, pln } from './catalog.js';
import { industries, industry, markdown, pairs, cases, minItemPrice } from './content.js';
import {
  I, esc, page, pageHero, ctaBand, faqHtml, faqJsonLd, packageCard, caseCard, FOUNDER,
} from './pages.js';

const ORG = () => ({ '@id': `${config.siteUrl}/#organization` });
const TOOL_CALC = '/narzedzia/kalkulator-kosztu-strony';
const TOOL_GBP = '/narzedzia/test-wizytowki-google';
const TOOL_ADS = '/narzedzia/kalkulator-budzetu-reklam';

// ------------------------------------------------------------------
// Branże
// ------------------------------------------------------------------
const industryCard = (x, i = 0) => `<a class="other-ind reveal" style="--d:${(i % 3) * 0.05}s" href="/branze/${x.slug}"><span class="icon-box">${I(x.icon || 'target')}</span><span><b>${esc(x.name)}</b><small>${esc(x.short || '')}</small></span>${I('arrow-up-right')}</a>`;

export function renderIndustries() {
  const list = industries();
  const crumbs = [['Branże', '/branze']];
  return page('/branze', {
    title: 'Marketing dla branż: usługi, noclegi, gastronomia | VELIO',
    description: 'Marketing dopasowany do branży: budowlanka, gastronomia, noclegi, transport i lokalne usługi. Zobacz, od czego zacząć w Twojej firmie.',
    crumbs,
    jsonld: [{ '@type': 'ItemList', itemListElement: list.map((x, i) => ({ '@type': 'ListItem', position: i + 1, url: `${config.siteUrl}/branze/${x.slug}`, name: x.name })) }],
    content: `${pageHero({ crumbs, kicker: 'Branże', title: 'Inna branża,', serif: 'inny plan.', lead: 'Restauracja, pensjonat i firma remontowa zdobywają klientów w inny sposób. Wybierz swoją branżę i zobacz, od czego najlepiej zacząć.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <div class="other-industries">${list.map(industryCard).join('')}</div>
      <p class="contact-only">${I('info')} Nie widzisz swojej branży? <a class="link-arrow" href="/kontakt" data-open-contact>Napisz ${I('arrow-up-right')}</a></p>
    </div></section>
    ${ctaBand()}`,
  });
}

export function renderIndustry(slug) {
  const x = industry(slug);
  if (!x) return null;
  const p = `/branze/${x.slug}`;
  const crumbs = [['Branże', '/branze'], [x.name, p]];
  const faq = pairs(x.faq);
  const svcs = (x.services || []).map(service).filter(Boolean);
  const pack = packages().find((y) => y.slug === x.package);
  const plan = plans().find((y) => y.slug === x.plan);
  const others = industries().filter((y) => y.slug !== x.slug);
  const related = cases().filter((c) => (x.services || []).some((sv) => (c.services || []).includes(sv))).slice(0, 2);
  const planPriceText = plan ? Object.values(planPrice(plan)).join(' ') : '';
  return page(p, {
    title: x.seo_title || `${x.name} | VELIO`,
    description: x.seo_description || x.lead,
    crumbs,
    jsonld: [
      { '@type': 'Service', name: x.name, serviceType: 'Marketing internetowy', url: `${config.siteUrl}${p}`, description: x.lead, audience: { '@type': 'BusinessAudience', name: x.short || x.name }, provider: ORG() },
      ...(faq.length ? [faqJsonLd(faq)] : []),
    ],
    content: `${pageHero({
      crumbs, kicker: x.short || 'Branża', title: x.name, lead: x.lead,
      actions: `<a class="button button-coral" href="/wycena" data-open-config>${I('wand-sparkles')} Bezpłatna wycena</a><a class="button button-ghost" href="/kontakt" data-open-contact>${I('messages-square')} Napisz do nas</a>`,
    })}
    <section class="section" style="padding-top:30px"><div class="wrap post-layout">
      <article class="prose">${markdown(x.body)}</article>
      <aside class="post-aside">
        ${svcs.length ? `<div class="toc"><b>Polecane usługi</b>${svcs.map((sv) => `<a href="/uslugi/${sv.slug}">${esc(sv.name)} <small>${esc(servicePrice(sv))}</small></a>`).join('')}</div>` : ''}
        ${plan ? `<a class="related-plan" style="margin:0" href="/abonamenty#${plan.slug}"><span class="icon-box">${I('repeat')}</span><span><b>${esc(plan.name)}</b><small>${esc(planPriceText)}</small></span>${I('arrow-up-right')}</a>` : ''}
      </aside>
    </div></section>
    ${pack ? `<section class="section offer-section" style="padding-top:0" aria-labelledby="pak-title"><div class="wrap">
      <span class="section-kicker">Dobry punkt startu</span><h2 class="sr-only" id="pak-title">Polecany pakiet</h2>
      <div class="offer-grid offer-grid-single" style="margin-top:22px">${packageCard(pack, 0)}</div>
    </div></section>` : ''}
    ${related.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Realizacje</span><div class="case-grid" style="margin-top:22px">${related.map(caseCard).join('')}</div></div></section>` : ''}
    ${faq.length ? `<section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Częste<br><span class="serif">pytania.</span></h2></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>` : ''}
    ${ctaBand()}
    ${others.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Inne branże</span><div class="other-industries" style="margin-top:22px">${others.map(industryCard).join('')}</div></div></section>` : ''}`,
  });
}

// ------------------------------------------------------------------
// Jak pracujemy
// ------------------------------------------------------------------
export function renderProcess() {
  const crumbs = [['Jak pracujemy', '/jak-pracujemy']];
  const steps = [
    ['Krótka rozmowa', 'Mówisz, ilu klientów potrzebujesz i co dziś działa, a co nie. Rozmowa jest bezpłatna i do niczego nie zobowiązuje.'],
    ['Wycena z zakresem', 'Dostajesz zakres, termin, cenę netto i listę kosztów zewnętrznych, takich jak budżet reklamowy czy licencje.'],
    ['Materiały i dostępy', 'Zbieramy teksty, zdjęcia i dostępy. Konta reklamowe, analityka i domena pozostają Twoją własnością.'],
    ['Realizacja w panelu', 'W panelu klienta widzisz etap projektu, dokumenty i aktualizacje, a zmiany zgłaszasz w jednym miejscu.'],
    ['Akceptacja i uruchomienie', 'Sprawdzasz efekt, nanosimy uzgodnione poprawki i uruchamiamy projekt razem z pomiarem.'],
    ['Pomiar i rozwój', 'Sprawdzamy, ile zapytań przynosi każdy kanał. Na tej podstawie decydujesz, co rozwijać dalej.'],
  ];
  const faq = [
    ['Czy muszę podpisać długą umowę?', 'Zlecenia jednorazowe kończą się po ich wykonaniu. Przy abonamentach czas trwania i okres wypowiedzenia ustalamy przed startem i zapisujemy w umowie.'],
    ['Czy po zakończeniu współpracy zostaną mi konta i strona?', 'Tak. Domena, konta reklamowe i analityka są Twoje. Zakres przekazania kodu i plików opisujemy w umowie.'],
    ['Ile osób pracuje przy projekcie?', 'Prowadzi go jedna osoba, z którą rozmawiasz od początku. Przy większych projektach dołączają zaufani specjaliści: graficy, copywriterzy i fotografowie.'],
  ];
  return page('/jak-pracujemy', {
    title: 'Jak pracujemy: od wyceny po wyniki | VELIO',
    description: 'Sześć etapów współpracy z VELIO: rozmowa, wycena z zakresem, realizacja w panelu klienta, uruchomienie i pomiar efektów. Bez ukrytych kosztów.',
    crumbs,
    jsonld: [
      { '@type': 'HowTo', name: 'Jak wygląda współpraca z VELIO', step: steps.map(([name, text], i) => ({ '@type': 'HowToStep', position: i + 1, name, text })) },
      faqJsonLd(faq),
    ],
    content: `${pageHero({ crumbs, kicker: 'Jak pracujemy', title: 'Bez niespodzianek.', serif: 'Od pierwszej rozmowy.', lead: 'Zanim zaczniemy, wiesz, co dokładnie zrobimy, ile to będzie kosztować i po czym poznasz efekt.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <ol class="step-list">${steps.map(([t, d], i) => `<li class="reveal"><span>${String(i + 1).padStart(2, '0')}</span><div><h2 style="font-size:18px;margin-bottom:6px">${esc(t)}</h2><p>${esc(d)}</p></div></li>`).join('')}</ol>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Pytania<br><span class="serif">o współpracę.</span></h2></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// Narzędzia
// ------------------------------------------------------------------
const TOOLS = [
  [TOOL_GBP, 'map-pin', 'Test wizytówki Google', 'Sprawdź w dwie minuty, czego brakuje w Twoim Profilu Firmy.'],
  [TOOL_CALC, 'calculator', 'Kalkulator kosztu strony', 'Oszacuj koszt strony lub sklepu na podstawie zakresu.'],
  [TOOL_ADS, 'chart-spline', 'Kalkulator budżetu reklam', 'Policz, ile zapytań da budżet i czy kampania się zwróci.'],
];

export function renderTools() {
  const crumbs = [['Narzędzia', '/narzedzia']];
  return page('/narzedzia', {
    title: 'Darmowe narzędzia marketingowe dla firm | VELIO',
    description: 'Darmowe narzędzia dla firm: test wizytówki Google, kalkulator kosztu strony i kalkulator budżetu reklam. Bez zakładania konta i bez podawania e-maila.',
    crumbs,
    jsonld: [{ '@type': 'ItemList', itemListElement: TOOLS.map(([url, , name], i) => ({ '@type': 'ListItem', position: i + 1, url: `${config.siteUrl}${url}`, name })) }],
    content: `${pageHero({ crumbs, kicker: 'Darmowe narzędzia', title: 'Policz i sprawdź', serif: 'samodzielnie.', lead: 'Bez konta i bez podawania e-maila. Dane, które wpiszesz, zostają w Twojej przeglądarce.' })}
    <section class="section" style="padding-top:30px"><div class="wrap"><div class="trust-grid" style="margin-top:0">${TOOLS.map(([url, ic, t, d], i) => `<a class="trust-card reveal" style="--d:${i * 0.05}s" href="${url}"><span class="icon-box">${I(ic)}</span><h2 style="font-size:19px">${esc(t)}</h2><p>${esc(d)}</p></a>`).join('')}</div></div></section>
    ${ctaBand()}`,
  });
}

const toolJsonLd = (name, url) => ({ '@type': 'WebApplication', name, url: `${config.siteUrl}${url}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' }, provider: ORG() });

export function renderSiteCost() {
  const p = TOOL_CALC;
  const crumbs = [['Narzędzia', '/narzedzia'], ['Kalkulator kosztu strony', p]];
  const faq = [
    ['Czy wynik to oferta?', 'Nie. To szacunek na podstawie cen „od” z naszego cennika. Dokładną kwotę podajemy po krótkiej rozmowie, zanim zaczniemy pracę.'],
    ['Skąd bierze się górna wartość?', 'Dodajemy zapas na typowe różnice w zakresie, np. większą liczbę treści lub dodatkowe poprawki. Rozbudowane projekty mogą kosztować więcej.'],
    ['Czy cena obejmuje domenę i hosting?', 'Nie. Domena i hosting są opłacane osobno. Opiekę nad stroną możesz wybrać w abonamencie.'],
  ];
  const kinds = [[690, 'Strona wizytówka (one page)'], [990, 'Landing page pod kampanię'], [1290, 'Strona firmowa (do 6 podstron)'], [1390, 'Sklep internetowy']];
  const extras = [[590, 'Google Analytics 4, Tag Manager i zgody'], [299, 'Założenie wizytówki Google'], [690, 'Projekt logo'], [990, 'SEO lokalne na start']];
  return page(p, {
    title: 'Kalkulator kosztu strony internetowej | VELIO',
    description: 'Policz orientacyjny koszt strony wizytówki, strony firmowej, landing page lub sklepu internetowego. Ceny netto, bez podawania e-maila.',
    crumbs,
    jsonld: [toolJsonLd('Kalkulator kosztu strony', p), faqJsonLd(faq)],
    content: `${pageHero({ crumbs, kicker: 'Darmowe narzędzie', title: 'Kalkulator', serif: 'kosztu strony.', lead: 'Wybierz rodzaj strony i potrzebne dodatki. Zobaczysz orientacyjny koszt netto oparty na naszym cenniku.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <form class="calc reveal" id="site-calc" novalidate>
        <div class="calc-fields">
          <div class="field"><label for="sc-kind">Rodzaj strony</label><select id="sc-kind" name="kind">${kinds.map(([v, l], i) => `<option value="${v}"${i === 2 ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select></div>
          <div class="field"><label for="sc-pages">Dodatkowe podstrony (150 zł netto za każdą)</label><input id="sc-pages" name="pages" type="number" min="0" max="50" value="0" inputmode="numeric"></div>
          ${extras.map(([v, l]) => `<label class="check-row"><input type="checkbox" value="${v}"> <span>${esc(l)} <small>+${esc(pln(v))}</small></span></label>`).join('')}
        </div>
        <div class="score-box" aria-live="polite">
          <span>Orientacyjnie, netto</span>
          <strong data-out="site-from">—</strong>
          <span>do około <b data-out="site-to">—</b></span>
          <p class="calc-note">${I('info')} Szacunek, nie oferta. Dokładną cenę potwierdzamy przed rozpoczęciem pracy.</p>
          <a class="button button-coral" href="/kontakt" data-open-contact data-contact-type="Strony internetowe" data-site-cta>${I('message-square')} Poproś o dokładną wycenę</a>
        </div>
      </form>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Jak czytać<br><span class="serif">wynik.</span></h2><a class="link-arrow" href="/blog/ile-kosztuje-strona-internetowa">Ile kosztuje strona: poradnik ${I('arrow-up-right')}</a></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>
    ${ctaBand()}`,
  });
}

export function renderGbpCheck() {
  const p = TOOL_GBP;
  const crumbs = [['Narzędzia', '/narzedzia'], ['Test wizytówki Google', p]];
  const min = minItemPrice('wizytowka-google');
  const checks = [
    [3, 'Profil jest zweryfikowany, a Ty masz do niego dostęp'],
    [3, 'Nazwa firmy jest prawdziwa, bez dopisanych słów kluczowych'],
    [3, 'Główna kategoria dokładnie opisuje to, co robisz'],
    [2, 'Dodane są kategorie dodatkowe i lista usług'],
    [3, 'Adres lub obszar działania i telefon są takie same jak na stronie'],
    [2, 'Godziny pracy są aktualne, także świąteczne'],
    [2, 'Opis mówi, co robisz i gdzie działasz'],
    [2, 'Profil ma link do strony internetowej'],
    [3, 'Masz kilkanaście prawdziwych zdjęć, w tym z ostatnich miesięcy'],
    [3, 'Regularnie prosisz klientów o opinie, z bezpośrednim linkiem'],
    [3, 'Odpowiadasz na każdą opinię, także negatywną'],
    [1, 'Publikujesz posty przynajmniej raz w miesiącu'],
  ];
  const faq = [
    ['Czy wysoki wynik oznacza pierwsze miejsce w Mapach?', 'Nie. Pozycja zależy też od odległości klienta, liczby opinii i konkurencji. Test pokazuje, czy Twój profil ma komplet podstaw.'],
    ['Czy wyniki są gdzieś zapisywane?', 'Nie. Test działa w Twojej przeglądarce. Wynik wyślesz nam tylko wtedy, gdy sam zdecydujesz się napisać.'],
  ];
  return page(p, {
    title: 'Test wizytówki Google: sprawdź swój profil | VELIO',
    description: 'Darmowy test Profilu Firmy w Google: 12 pytań o kategorie, dane, zdjęcia i opinie. Zobacz, co poprawić, aby wizytówka przyciągała więcej klientów.',
    crumbs,
    jsonld: [toolJsonLd('Test wizytówki Google', p), faqJsonLd(faq)],
    content: `${pageHero({ crumbs, kicker: 'Darmowe narzędzie', title: 'Test', serif: 'wizytówki Google.', lead: 'Zaznacz to, co masz już zrobione. Od razu zobaczysz wynik i listę rzeczy do poprawy.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <form class="calc reveal" id="gbp-check" novalidate>
        <fieldset class="check-audit" style="margin:0"><legend class="sr-only">Lista kontrolna wizytówki Google</legend>
          ${checks.map(([v, l]) => `<label><input type="checkbox" value="${v}"> <span>${esc(l)}</span></label>`).join('')}
        </fieldset>
        <div class="score-box" aria-live="polite">
          <span>Twój wynik</span>
          <strong data-out="gbp-score">0%</strong>
          <p data-out="gbp-note"></p>
          <a class="button button-coral" href="/kontakt" data-open-contact data-contact-type="Wizytówka Google" data-gbp-cta>${I('message-square')} Pomóżcie mi to poprawić</a>
          ${min ? `<a class="link-arrow" href="/uslugi/wizytowka-google">Usługa od ${esc(pln(min))} netto ${I('arrow-up-right')}</a>` : ''}
        </div>
      </form>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">O teście<br><span class="serif">wizytówki.</span></h2><a class="link-arrow" href="/blog/jak-zalozyc-wizytowke-google">Jak założyć wizytówkę ${I('arrow-up-right')}</a></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// Sekcje strony głównej, sitemap i llms.txt
// ------------------------------------------------------------------
export function homeSections() {
  const list = industries().slice(0, 6);
  const topPlans = ['widocznosc-lokalna', 'opieka-plus', 'marketing-lokalny'].map((s) => plans().find((x) => x.slug === s)).filter(Boolean);
  return `
    <section class="section" style="padding-top:0" aria-labelledby="owner-home"><div class="wrap">
      <div class="owner-band reveal">
        <div><span class="section-kicker">Kto za tym stoi</span><h2 class="section-title" id="owner-home">Rozmawiasz z osobą,<br><span class="serif">która to robi.</span></h2>
          <p style="margin-top:14px">VELIO prowadzi ${esc(FOUNDER.name)}, ${esc(FOUNDER.role)}. Bez opiekuna klienta i przekazywania wiadomości. Przy większych projektach dołączają zaufani specjaliści.</p>
          <a class="link-arrow" style="margin-top:14px" href="/jak-pracujemy">Zobacz, jak pracujemy ${I('arrow-up-right')}</a></div>
        <ul>
          <li>${I('check')} Zakres, cena i koszty zewnętrzne znane przed startem</li>
          <li>${I('check')} Konta reklamowe, domena i analityka pozostają Twoje</li>
          <li>${I('check')} Postęp prac i dokumenty w panelu klienta</li>
          <li>${I('check')} Na miejscu w Słupsku i okolicy, zdalnie w całej Polsce</li>
        </ul>
      </div>
    </div></section>
    ${list.length ? `<section class="section" style="padding-top:0" aria-labelledby="branze-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Branże</span><h2 class="section-title" id="branze-home">Inna branża,<br><span class="serif">inny plan.</span></h2></div><p class="reveal"><a class="link-arrow" href="/branze">Wszystkie branże ${I('arrow-up-right')}</a></p></div>
      <div class="other-industries">${list.map(industryCard).join('')}</div></div></section>` : ''}
    ${topPlans.length ? `<section class="section" style="padding-top:0" aria-labelledby="abo-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Stała współpraca</span><h2 class="section-title" id="abo-home">Marketing<br><span class="serif">w stałej cenie.</span></h2></div><p class="reveal"><a class="link-arrow" href="/abonamenty">Wszystkie abonamenty ${I('arrow-up-right')}</a></p></div>
      <div class="trust-grid" style="margin-top:0">${topPlans.map((pl, i) => { const pr = planPrice(pl); return `<a class="trust-card reveal" style="--d:${i * 0.05}s" href="/abonamenty#${pl.slug}"><span class="icon-box">${I(pl.icon || 'repeat')}</span><h3>${esc(pl.name)}</h3><p>${esc(pl.summary)}</p><p style="margin-top:12px;color:var(--ink)"><b>${esc(pr.main)}</b> ${esc(pr.unit)}</p></a>`; }).join('')}</div></div></section>` : ''}
    <section class="section" style="padding-top:0" aria-labelledby="tools-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Darmowe narzędzia</span><h2 class="section-title" id="tools-home">Sprawdź sam,<br><span class="serif">zanim napiszesz.</span></h2></div><p class="reveal"><a class="link-arrow" href="/narzedzia">Wszystkie narzędzia ${I('arrow-up-right')}</a></p></div>
      <div class="other-industries">${TOOLS.map(([url, ic, t, d]) => `<a class="other-ind reveal" href="${url}"><span class="icon-box">${I(ic)}</span><span><b>${esc(t)}</b><small>${esc(d)}</small></span>${I('arrow-up-right')}</a>`).join('')}</div></div></section>`;
}

export function extraPages(day) {
  return [
    { path: '/branze', name: 'Branże', pr: '0.7' },
    ...industries().map((x) => ({ path: `/branze/${x.slug}`, name: `Branża: ${x.name}`, pr: '0.7', lastmod: day(x.updated_at) })),
    { path: '/jak-pracujemy', name: 'Jak pracujemy', pr: '0.6' },
    { path: '/narzedzia', name: 'Narzędzia', pr: '0.6' },
    { path: TOOL_GBP, name: 'Test wizytówki Google', pr: '0.6' },
    { path: TOOL_CALC, name: 'Kalkulator kosztu strony', pr: '0.6' },
    { path: TOOL_ADS, name: 'Kalkulator budżetu reklam', pr: '0.5' },
  ];
}

export function extraLlms(line) {
  return `
## Branże
${industries().map((x) => line(x.name, `/branze/${x.slug}`, x.short)).join('\n')}

## Darmowe narzędzia
${TOOLS.map(([url, , t, d]) => line(t, url, d)).join('\n')}
${line('Jak pracujemy', '/jak-pracujemy')}
`;
}
