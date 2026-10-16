import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, googleEnabled } from '../config.js';
import { company, flag } from '../lib/settings.js';
import {
  GROUPS, services, service, packages, plans, faqs, iconFor, servicePrice, packagePrice, planPrice, contactTopics,
} from './catalog.js';

const VIEWS = path.join(ROOT, 'views');
const cache = new Map();

export const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function readView(name) {
  if (config.isProd && cache.has(name)) return cache.get(name);
  let html = fs.readFileSync(path.join(VIEWS, `${name}.html`), 'utf8');
  // SSI: <!--#include partial-->
  html = html.replace(/<!--#include ([\w/-]+)-->/g, (_, p) => readView(`partials/${p}`));
  if (config.isProd) cache.set(name, html);
  return html;
}

export function iconSvg(name, cls = '') {
  return `<svg class="i${cls ? ' ' + cls : ''}" aria-hidden="true" focusable="false"><use href="/assets/icons.svg?v=${config.version}#${name}"></use></svg>`;
}
const I = (n, c) => `<i data-lucide="${n}"${c ? ` class="${c}"` : ''}></i>`;

function orgJsonLd() {
  const c = company();
  return {
    '@type': 'Organization',
    '@id': `${config.siteUrl}/#organization`,
    name: 'VELIO',
    legalName: c.legalName || undefined,
    url: config.siteUrl,
    logo: `${config.siteUrl}/assets/img/icon-512.png`,
    email: c.email || undefined,
    telephone: c.phone || undefined,
    address: c.address || undefined,
  };
}

function jsonLdScript(graph) {
  const data = { '@context': 'https://schema.org', '@graph': graph };
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

const breadcrumbLd = (items) => ({
  '@type': 'BreadcrumbList',
  itemListElement: [['VELIO', '/'], ...items].map(([name, p], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${config.siteUrl}${p}` })),
});
const crumbsHtml = (items) => `<nav aria-label="Okruszki"><ol class="breadcrumbs"><li><a href="/">VELIO</a></li>${items.map(([name, p], i) => (i === items.length - 1 ? `<li aria-current="page">${esc(name)}</li>` : `<li><a href="${p}">${esc(name)}</a></li>`)).join('')}</ol></nav>`;

// ---------- Elementy wspólne ----------
function contactDirect() {
  const c = company();
  const links = [];
  if (c.email) links.push(`<a href="mailto:${esc(c.email)}">${I('mail')} ${esc(c.email)}</a>`);
  if (c.phone) links.push(`<a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${I('phone')} ${esc(c.phone)}</a>`);
  return links.join('');
}

function companyLine() {
  const c = company();
  return [c.legalName, c.address, c.nip ? `NIP ${c.nip}` : ''].filter(Boolean).map(esc).join(' · ');
}

const topicOptions = (selected = 'Bezpłatna wycena') => contactTopics().map((t) => `<option${t === selected ? ' selected' : ''}>${esc(t)}</option>`).join('');

/**
 * Renderuje widok z metadanymi SEO.
 * vars: title, description, path, robots, jsonld (tablica węzłów @graph), bodyClass, raw (wstawki HTML)
 */
export function render(view, vars = {}) {
  const canonical = `${config.siteUrl}${vars.path ?? '/'}`;
  const c = company();
  const base = {
    TITLE: esc(vars.title || 'VELIO — agencja marketingowa: strony, SEO, reklamy i automatyzacje AI'),
    DESCRIPTION: esc(vars.description || ''),
    CANONICAL: canonical,
    ROBOTS: vars.robots || 'index, follow, max-image-preview:large',
    OG_TYPE: vars.ogType || 'website',
    OG_IMAGE: `${config.siteUrl}/assets/img/og-image.png`,
    SITE_URL: config.siteUrl,
    V: config.version,
    YEAR: String(new Date().getFullYear()),
    BODY_CLASS: vars.bodyClass || '',
    CONTACT_EMAIL: esc(c.email),
    CONTACT_PHONE: esc(c.phone),
    CONTACT_DIRECT: contactDirect(),
    LEGAL_NAME: esc(c.legalName || 'VELIO'),
    COMPANY_ADDRESS: esc(c.address),
    COMPANY_LINE: companyLine(),
    JSONLD: jsonLdScript([orgJsonLd(), ...(vars.jsonld || [])]),
    FOOTER_SERVICES: services().slice(0, 7).map((s) => `<a href="/uslugi/${s.slug}">${esc(s.name)}</a>`).join(''),
    TOPIC_OPTIONS: topicOptions(vars.topic),
    CFG_SERVICES: services().map((s) => `<label class="choice"><input type="checkbox" value="${esc(s.name)}" data-slug="${s.slug}"><span><b>${esc(s.name)}</b><span>${esc(s.summary)}</span></span></label>`).join(''),
    CFG_PACKAGES: esc(JSON.stringify(packages().map((p) => ({ slug: p.slug, name: p.name, priceFrom: p.priceFrom, unit: p.priceUnit })))),
  };
  const all = { ...base, ...(vars.raw || {}) };
  let html = readView(view);
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => (k in all ? all[k] : ''));
  html = html.replace(/<i data-lucide="([\w-]+)"(?: class="([^"]*)")?><\/i>/g, (_, n, cl) => iconSvg(n, cl));
  return html;
}

/** Podstrona w ogólnym szablonie (nagłówek, treść, stopka, konfigurator wyceny). */
function page(p, { title, description, crumbs, jsonld = [], content, bodyClass = 'subpage', topic }) {
  return render('site/page', {
    path: p, title, description, bodyClass, topic,
    jsonld: [...(crumbs ? [breadcrumbLd(crumbs)] : []), ...jsonld],
    raw: { CONTENT: content },
  });
}

function pageHero({ crumbs, kicker, title, serif, lead, actions = '', aside = '' }) {
  return `
    <section class="ind-hero page-hero">
      <div class="wrap">
        ${crumbsHtml(crumbs)}
        <div class="ind-hero-grid${aside ? '' : ' single'}">
          <div class="reveal">
            ${kicker ? `<span class="section-kicker">${esc(kicker)}</span>` : ''}
            <h1>${esc(title)}${serif ? ` <span class="serif">${esc(serif)}</span>` : ''}</h1>
            ${lead ? `<p class="lead-text">${esc(lead)}</p>` : ''}
            ${actions ? `<div class="hero-actions">${actions}</div>` : ''}
          </div>
          ${aside ? `<div class="ind-visual reveal" style="--d:.1s">${aside}</div>` : ''}
        </div>
      </div>
    </section>`;
}

const ctaBand = (title = 'Porozmawiajmy o Twoich klientach.', text = 'Krótki brief, konkretna wycena i plan działań. Bez zobowiązań.') => `
    <section class="cta-band" aria-label="Rozpocznij współpracę">
      <div class="wrap">
        <div class="cta-inner reveal">
          <div><h2>${esc(title)}</h2><p>${esc(text)}</p></div>
          <div class="cta-actions">
            <a class="button button-dark" href="/wycena" data-open-config>${I('wand-sparkles')} Bezpłatna wycena</a>
            <a class="button button-light" href="/kontakt">${I('message-square')} Napisz do nas</a>
          </div>
        </div>
      </div>
    </section>`;

function faqHtml(list, openFirst = true) {
  return list.map(([q, a], i) => `<details${openFirst && i === 0 ? ' open' : ''}><summary>${esc(q)}<span class="faq-plus">${I('plus')}</span></summary><p>${esc(a)}</p></details>`).join('');
}
export function faqJsonLd(list) {
  return { '@type': 'FAQPage', mainEntity: list.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) };
}
const faqPairs = () => faqs().map((f) => [f.q, f.a]);

function serviceCard(s, i = 0) {
  return `<a class="svc-card reveal" style="--d:${(i % 3) * 0.05}s" href="/uslugi/${s.slug}">
    <span class="icon-box">${I(iconFor(s))}</span>
    <h3>${esc(s.name)}</h3>
    <p>${esc(s.summary)}</p>
    <span class="svc-foot"><em>${esc(servicePrice(s))}</em>${I('arrow-up-right')}</span>
  </a>`;
}

function packageCard(p, i = 0, { detailed = false } = {}) {
  const price = packagePrice(p);
  const topic = `Pakiet ${p.name}`;
  const list = (arr, ic) => arr.map((x) => `<li>${I(ic)} ${esc(x)}</li>`).join('');
  return `<article class="offer-card${p.featured ? ' featured' : ''} reveal" style="--d:${(i % 3) * 0.06}s" id="pakiet-${p.slug}">
    ${p.featured ? '<span class="offer-badge">Najczęściej wybierany</span>' : ''}
    <span class="offer-icon">${I(['sprout', 'target', 'workflow', 'rocket', 'blocks'][i % 5])}</span>
    <h3>${esc(p.name)}</h3>
    <p>${esc(p.audience)}</p>
    <div class="price">${esc(price.main)} <span>${esc(price.unit)}</span></div>
    <div class="setup">${esc(p.duration || 'Termin ustalany po briefie')}</div>
    ${detailed ? `<p class="offer-desc">${esc(p.description)}</p>` : ''}
    <ul>${list(detailed ? p.includes : p.includes.slice(0, 5), 'check')}</ul>
    ${detailed && p.limits?.length ? `<div class="offer-extra"><b>Ograniczenia</b><ul>${list(p.limits, 'info')}</ul></div>` : ''}
    ${detailed && p.extensions?.length ? `<div class="offer-extra"><b>Możliwe rozszerzenia</b><ul>${list(p.extensions, 'plus')}</ul></div>` : ''}
    ${detailed && p.addons?.length ? `<div class="offer-extra"><b>Dodatki</b><ul>${p.addons.map((a) => `<li>${I('circle-plus')} ${esc(a.name)} <small>— ${esc(a.note)}</small></li>`).join('')}</ul></div>` : ''}
    ${detailed && p.separateCosts ? `<p class="offer-note-sm">${I('receipt-text')} ${esc(p.separateCosts)}</p>` : ''}
    <a class="button ${p.featured ? 'button-coral' : 'button-light'}" href="/kontakt?temat=${encodeURIComponent(topic)}" data-open-contact data-contact-type="${esc(topic)}">${I('message-square')} Zapytaj o ${esc(p.name)}</a>
  </article>`;
}

// ------------------------------------------------------------------
// Strona główna
// ------------------------------------------------------------------
function groupTabsHtml() {
  const list = services();
  const groups = GROUPS.map((g) => ({ ...g, items: list.filter((s) => s.group === g.key) })).filter((g) => g.items.length);
  const tabs = groups.map((g, i) => `
    <button class="industry-tab${i === 0 ? ' is-active' : ''}" role="tab" id="tab-${g.key}" aria-controls="panel-${g.key}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}">
      <span class="tab-icon">${I(g.icon)}</span>
      <span><b>${esc(g.name)}</b><small>${esc(g.tag)}</small></span>
      ${I('arrow-right')}
    </button>`).join('');
  const panels = groups.map((g, i) => {
    const lead = g.items[0];
    const chips = [...new Set(g.items.flatMap((s) => s.scope.slice(0, 3)))].slice(0, 6);
    return `
    <div class="industry-panel" role="tabpanel" id="panel-${g.key}" aria-labelledby="tab-${g.key}"${i === 0 ? '' : ' hidden'}>
      <div class="industry-preview-inner">
        <div>
          <div class="meta"><span class="pill">VELIO / ${esc(g.name)}</span><span class="pill">${g.items.length} ${g.items.length === 1 ? 'usługa' : g.items.length < 5 ? 'usługi' : 'usług'}</span></div>
          <h3>${esc(lead.summary)}</h3>
          <p class="lead">${esc(lead.intro)}</p>
        </div>
        <div class="industry-board">
          <div class="board-head"><b>Usługi w tym obszarze</b><span>KLIKNIJ, BY POZNAĆ ZAKRES</span></div>
          <div class="board-grid">${g.items.map((s) => `<a class="board-item" href="/uslugi/${s.slug}"><span class="board-icon">${I(iconFor(s))}</span><b>${esc(s.name)}</b><span>${esc(servicePrice(s))}</span></a>`).join('')}</div>
        </div>
        <div class="industry-foot">
          <div class="industry-features">${chips.map((f) => `<span>${esc(f)}</span>`).join('')}</div>
          <a class="button button-dark button-small" href="/uslugi/${lead.slug}">${esc(lead.name)} ${I('arrow-up-right')}</a>
        </div>
      </div>
    </div>`;
  }).join('');
  return { tabs, panels };
}

export function renderHome() {
  const { tabs, panels } = groupTabsHtml();
  const pk = packages();
  const featured = [pk.find((p) => p.slug === 'start'), pk.find((p) => p.featured), pk.find((p) => p.slug === 'growth')].filter(Boolean);
  const show = (featured.length === 3 ? featured : pk.slice(0, 3));
  const minPrice = Math.min(...pk.filter((p) => p.priceFrom).map((p) => p.priceFrom));
  return render('site/index', {
    path: '/',
    title: 'VELIO — agencja marketingowa: strony, SEO, reklamy i automatyzacje AI',
    description: 'VELIO łączy strategię, strony internetowe, SEO, kampanie Google i Meta, automatyzacje AI oraz branding w jeden system pozyskiwania klientów. Pakiety od 1 490 zł netto.',
    jsonld: [
      { '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, url: config.siteUrl, name: 'VELIO', inLanguage: 'pl-PL', publisher: { '@id': `${config.siteUrl}/#organization` } },
      {
        '@type': 'ProfessionalService', name: 'VELIO — agencja marketingowa', url: config.siteUrl, areaServed: { '@type': 'Country', name: 'Polska' },
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Pakiety VELIO',
          itemListElement: pk.map((p) => ({ '@type': 'Offer', name: p.name, description: p.description, ...(p.priceFrom ? { price: String(p.priceFrom), priceCurrency: 'PLN' } : {}) })),
        },
      },
      faqJsonLd(faqPairs()),
    ],
    raw: {
      GROUP_TABS: tabs,
      GROUP_PANELS: panels,
      FAQ: faqHtml(faqPairs()),
      HOME_PACKAGES: show.map((p, i) => packageCard(p, pk.indexOf(p))).join(''),
      COUNT_SERVICES: String(services().length),
      COUNT_PACKAGES: String(pk.length),
      COUNT_PLANS: String(plans().length),
      MIN_PRICE: new Intl.NumberFormat('pl-PL').format(Number.isFinite(minPrice) ? minPrice : 1490),
    },
  });
}

// ------------------------------------------------------------------
// Usługi
// ------------------------------------------------------------------
export function renderServices() {
  const list = services();
  const groupsHtml = GROUPS.map((g) => {
    const items = list.filter((s) => s.group === g.key);
    if (!items.length) return '';
    return `<section class="svc-group" aria-labelledby="g-${g.key}">
      <div class="svc-group-head reveal"><span class="icon-box">${I(g.icon)}</span><div><h2 id="g-${g.key}">${esc(g.name)}</h2><p>${esc(g.tag)}</p></div></div>
      <div class="svc-grid">${items.map(serviceCard).join('')}</div>
    </section>`;
  }).join('');
  return page('/uslugi', {
    title: 'Usługi — strony, SEO, reklamy, AI i branding | VELIO',
    description: 'Wszystkie usługi VELIO: strony internetowe, pozycjonowanie SEO, reklamy Google i Meta, AI i automatyzacje, branding, druk, CRM, analityka i ekspansja zagraniczna.',
    crumbs: [['Usługi', '/uslugi']],
    jsonld: [{ '@type': 'ItemList', itemListElement: list.map((s, i) => ({ '@type': 'ListItem', position: i + 1, url: `${config.siteUrl}/uslugi/${s.slug}`, name: s.name })) }],
    content: `${pageHero({
      crumbs: [['Usługi', '/uslugi']], kicker: `${list.length} usług · 5 obszarów`, title: 'Cały marketing.', serif: 'Jeden partner.',
      lead: 'Strona wie, co obiecuje reklama, a CRM wie, skąd przyszedł klient. Wybierz pojedynczą usługę albo połącz kilka w jeden system pozyskiwania klientów.',
      actions: `<a class="button button-coral" href="/wycena" data-open-config>${I('wand-sparkles')} Bezpłatna wycena</a><a class="button button-ghost" href="/pakiety">${I('package')} Zobacz pakiety</a>`,
    })}
    <div class="wrap svc-groups">${groupsHtml}</div>
    ${ctaBand()}`,
  });
}

export function renderService(slug) {
  const s = service(slug);
  if (!s) return null;
  const others = services().filter((x) => x.slug !== slug);
  const p = `/uslugi/${s.slug}`;
  const priceBox = `
    <div class="industry-board svc-board">
      <div class="board-head"><b>Jak pracujemy</b><span>${s.process.length} ETAPÓW</span></div>
      <ol class="svc-steps">${s.process.map((st, i) => `<li><span class="svc-step-no">${String(i + 1).padStart(2, '0')}</span><div><b>${esc(st.title)}</b><span>${esc(st.text)}</span></div></li>`).join('')}</ol>
      <div class="svc-price"><span>Cena</span><strong>${esc(servicePrice(s))}</strong>${s.pricing?.note ? `<small>${esc(s.pricing.note)}</small>` : ''}</div>
    </div>`;
  const faqList = (s.faq || []).map((f) => [f.q, f.a]);
  const related = plans().find((pl) => pl.relatedService === s.slug);
  return page(p, {
    title: `${s.seo?.title || s.name} | VELIO`,
    description: s.seo?.description || s.summary,
    crumbs: [['Usługi', '/uslugi'], [s.name, p]],
    topic: s.name,
    jsonld: [
      { '@type': 'Service', name: s.name, description: s.summary, provider: { '@id': `${config.siteUrl}/#organization` }, areaServed: { '@type': 'Country', name: 'Polska' }, ...(s.pricing?.kind === 'from' && s.pricing.amount ? { offers: { '@type': 'Offer', price: String(s.pricing.amount), priceCurrency: 'PLN' } } : {}) },
      ...(faqList.length ? [faqJsonLd(faqList)] : []),
    ],
    content: `
    <section class="ind-hero">
      <div class="wrap">
        ${crumbsHtml([['Usługi', '/uslugi'], [s.name, p]])}
        <div class="ind-hero-grid">
          <div class="reveal">
            <span class="ind-tag"><span class="ic">${I(iconFor(s))}</span> ${esc((GROUPS.find((g) => g.key === s.group) || {}).name || 'Usługa')}</span>
            <h1>${esc(s.name)}</h1>
            <p class="lead-text">${esc(s.intro)}</p>
            <div class="hero-actions">
              <a class="button button-coral" href="/wycena" data-open-config data-service="${s.slug}">${I('wand-sparkles')} Wyceń usługę</a>
              <a class="button button-ghost" href="/kontakt?temat=${encodeURIComponent(s.name)}" data-open-contact data-contact-type="${esc(s.name)}">${I('messages-square')} Zadaj pytanie</a>
            </div>
            <div class="industry-features" style="margin-top:28px">${s.scope.slice(0, 6).map((f) => `<span>${esc(f)}</span>`).join('')}</div>
          </div>
          <div class="ind-visual reveal" style="--d:.1s">${priceBox}</div>
        </div>
      </div>
    </section>

    <section class="pain-section" aria-labelledby="scope-title">
      <div class="wrap pain-grid">
        <div class="reveal">
          <span class="section-kicker">Zakres</span>
          <h2 class="section-title" id="scope-title">Co dokładnie<br><span class="serif">dla Ciebie zrobimy.</span></h2>
        </div>
        <ul class="pain-list scope-list reveal" style="--d:.1s">${s.scope.map((x) => `<li>${I('check')}<span>${esc(x)}</span></li>`).join('')}</ul>
      </div>
    </section>

    <section class="section" aria-labelledby="benefits-title">
      <div class="wrap">
        <div class="split-intro" style="margin-bottom:0">
          <div class="reveal">
            <span class="section-kicker">Efekt</span>
            <h2 class="section-title" id="benefits-title">Co zyskujesz<br><span class="serif">w praktyce.</span></h2>
          </div>
          <p class="reveal" style="--d:.1s">${esc(s.summary)} Każdy projekt kończymy pomiarem, żeby było wiadomo, co przynosi wynik.</p>
        </div>
        <div class="ind-modules">${s.benefits.map((b, i) => `<article class="ind-module reveal" style="--d:${(i % 3) * 0.05}s"><span class="icon-box">${I(['target', 'gauge', 'pencil-line', 'chart-spline', 'shield-check', 'sparkles'][i % 6])}</span><h3>${esc(b.title)}</h3><p>${esc(b.text)}</p></article>`).join('')}</div>
        ${related ? `<a class="related-plan reveal" href="/abonamenty#${related.slug}"><span class="icon-box">${I('repeat')}</span><span><b>Stała współpraca: ${esc(related.name)}</b><small>${esc(related.summary)}</small></span>${I('arrow-up-right')}</a>` : ''}
      </div>
    </section>

    ${faqList.length ? `<section class="section" style="padding-top:0" aria-labelledby="faq-title">
      <div class="wrap faq-grid">
        <div class="faq-side reveal">
          <span class="section-kicker">FAQ</span>
          <h2 class="section-title" id="faq-title">Pytania o<br><span class="serif">${esc(s.name.toLowerCase())}.</span></h2>
          <p>Masz inne pytanie? Napisz — odpowiemy konkretnie.</p>
          <a class="button button-dark" href="/kontakt?temat=${encodeURIComponent(s.name)}" data-open-contact data-contact-type="${esc(s.name)}">${I('message-square')} Zadaj pytanie</a>
        </div>
        <div class="faq-list reveal" style="--d:.1s">${faqHtml(faqList)}</div>
      </div>
    </section>` : ''}

    ${ctaBand(`Wyceńmy: ${s.name.toLowerCase()}.`, 'Opisz cel w kilku zdaniach — odpowiemy z zakresem i ceną.')}

    <section class="section" style="padding-top:0" aria-labelledby="others-title">
      <div class="wrap">
        <span class="section-kicker">Inne usługi</span>
        <h2 class="sr-only" id="others-title">Inne usługi</h2>
        <div class="other-industries">${others.map((o) => `<a class="other-ind" href="/uslugi/${o.slug}"><span class="icon-box">${I(iconFor(o))}</span><span><b>${esc(o.name)}</b><small>${esc(servicePrice(o))}</small></span>${I('arrow-up-right')}</a>`).join('')}</div>
      </div>
    </section>`,
  });
}

// ------------------------------------------------------------------
// Pakiety i abonamenty
// ------------------------------------------------------------------
export function renderPackages() {
  const pk = packages();
  return page('/pakiety', {
    title: 'Pakiety na start — od strony do systemu sprzedaży | VELIO',
    description: `Pakiety VELIO: ${pk.map((p) => p.name).join(', ')}. Jasny zakres, ograniczenia i koszty zewnętrzne opisane przed startem.`,
    crumbs: [['Pakiety', '/pakiety']],
    jsonld: [{ '@type': 'OfferCatalog', name: 'Pakiety VELIO', itemListElement: pk.map((p) => ({ '@type': 'Offer', name: p.name, description: p.description, ...(p.priceFrom ? { price: String(p.priceFrom), priceCurrency: 'PLN' } : {}) })) }],
    content: `${pageHero({
      crumbs: [['Pakiety', '/pakiety']], kicker: 'Pakiety', title: 'Punkt startu.', serif: 'Bez gwiazdek drobnym drukiem.',
      lead: 'Każdy pakiet ma rozpisany zakres, ograniczenia i koszty zewnętrzne. Ostateczną cenę potwierdzamy po krótkiej rozmowie — na stronie nie ma płatności ani automatycznego zakupu.',
      actions: `<a class="button button-coral" href="/wycena" data-open-config>${I('wand-sparkles')} Dobierz pakiet</a><a class="button button-ghost" href="/abonamenty">${I('repeat')} Stała współpraca</a>`,
    })}
    <section class="section offer-section" style="padding-top:40px">
      <div class="wrap">
        <div class="offer-grid offer-grid-all">${pk.map((p, i) => packageCard(p, i, { detailed: true })).join('')}</div>
        <p class="contact-only">${I('info')} Ceny netto. Budżet reklamowy płacisz bezpośrednio platformom (Google, Meta) — nie jest wliczony w pakiet.</p>
      </div>
    </section>
    ${ctaBand('Nie wiesz, który pakiet wybrać?', 'Odpowiedz na kilka pytań — zaproponujemy najlepszy punkt startu.')}`,
  });
}

export function renderPlans() {
  const list = plans();
  const BILL = { subscription: 'Abonament', invoice: 'Faktura miesięczna', quote: 'Wycena', manual_approval: 'Akceptacja projektu', one_time: 'Jednorazowo' };
  const cards = list.map((pl, i) => {
    const price = planPrice(pl);
    const rel = pl.relatedService ? service(pl.relatedService) : null;
    return `<article class="plan-card reveal" style="--d:${(i % 3) * 0.06}s" id="${pl.slug}">
      <div class="plan-top"><span class="icon-box">${I(['shield-check', 'megaphone', 'search', 'bot', 'printer', 'clipboard-check'][i % 6])}</span><div class="plan-bill">${(pl.billing || []).map((b) => `<span>${esc(BILL[b] || b)}</span>`).join('')}</div></div>
      <h3>${esc(pl.name)}</h3>
      <p>${esc(pl.summary)}</p>
      <div class="price">${esc(price.main)} <span>${esc(price.unit)}</span></div>
      <ul>${pl.features.map((f) => `<li>${I('check')} ${esc(f)}</li>`).join('')}</ul>
      <div class="plan-actions">
        <a class="button button-light button-small" href="/kontakt?temat=${encodeURIComponent(pl.name)}" data-open-contact data-contact-type="${esc(pl.name)}">${I('message-square')} Zapytaj</a>
        ${rel ? `<a class="link-arrow" href="/uslugi/${rel.slug}">${esc(rel.name)} ${I('arrow-up-right')}</a>` : ''}
      </div>
    </article>`;
  }).join('');
  return page('/abonamenty', {
    title: 'Stała współpraca — opieka, reklamy, SEO i AI w abonamencie | VELIO',
    description: 'Abonamenty VELIO: opieka nad stroną, stała obsługa reklam, abonament SEO, abonament AI, druk na zamówienie i audyt marketingowy.',
    crumbs: [['Abonamenty', '/abonamenty']],
    content: `${pageHero({
      crumbs: [['Abonamenty', '/abonamenty']], kicker: 'Stała współpraca', title: 'Uruchomić to początek.', serif: 'Rozwijać to wynik.',
      lead: 'Kampanie, SEO i automatyzacje dają najwięcej, gdy ktoś je regularnie poprawia. Abonament rozliczamy miesięcznie, a warunki i okres wypowiedzenia ustalamy w umowie przed startem.',
      actions: `<a class="button button-coral" href="/kontakt?temat=${encodeURIComponent('Bezpłatna wycena')}" data-open-contact>${I('messages-square')} Porozmawiajmy</a>`,
    })}
    <section class="section" style="padding-top:40px"><div class="wrap"><div class="plan-grid">${cards}</div></div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// O nas, kontakt, FAQ, wycena
// ------------------------------------------------------------------
export function renderAbout() {
  const principles = [
    ['target', 'Najpierw cel, potem narzędzie', 'Nie zaczynamy od pytania „jaka strona?” ani „ile na reklamy?”. Zaczynamy od tego, ilu klientów potrzebujesz i skąd mają przyjść.'],
    ['receipt-text', 'Mówimy, co jest w cenie', 'Każda wycena ma rozpisany zakres, ograniczenia i koszty zewnętrzne. Bez gwiazdek drobnym drukiem.'],
    ['chart-spline', 'Dane z podanym źródłem', 'W raportach pokazujemy, skąd pochodzi każda liczba i za jaki okres. Nie pokazujemy wyników, których nie da się sprawdzić.'],
    ['blocks', 'Budujemy, żeby rozwijać', 'Strona, kampanie, CRM i automatyzacje są projektowane jako jeden system, który można rozbudowywać bez zaczynania od nowa.'],
    ['key-round', 'Twoje konta, Twoje dane', 'Konta reklamowe, analityka i domena są Twoje. Po zakończeniu współpracy nic nie znika.'],
    ['layout-dashboard', 'Wszystko w panelu klienta', 'Etapy projektu, zgłoszenia, faktury i dokumenty masz w jednym miejscu — bez dopytywania mailem.'],
  ];
  return page('/o-nas', {
    title: 'O nas — partner technologiczno-marketingowy | VELIO',
    description: 'VELIO łączy strategię, technologię i kreatywność w jeden system pozyskiwania klientów. Poznaj nasze zasady pracy.',
    crumbs: [['O nas', '/o-nas']],
    content: `${pageHero({
      crumbs: [['O nas', '/o-nas']], kicker: 'O VELIO', title: 'Partner,', serif: 'nie podwykonawca.',
      lead: 'VELIO pomaga firmom zdobywać klientów, budować rozpoznawalność, zwiększać sprzedaż i automatyzować codzienną pracę. Łączymy kompetencje, które zwykle są rozproszone między kilka agencji.',
    })}
    <section class="section" style="padding-top:40px" aria-labelledby="zasady">
      <div class="wrap">
        <div class="split-intro">
          <div class="reveal"><span class="section-kicker">Zasady</span><h2 class="section-title" id="zasady">Jak myślimy<br><span class="serif">o pracy.</span></h2></div>
          <p class="reveal" style="--d:.1s">Pięć obszarów — Digital & Web, Performance Marketing, AI & Automation, Branding & Creative oraz Growth & Sales — w jednym zespole. Dzięki temu strona wie, co obiecuje reklama, a CRM wie, skąd przyszedł klient.</p>
        </div>
        <div class="trust-grid">${principles.map(([ic, t, d], i) => `<article class="trust-card reveal" style="--d:${(i % 3) * 0.05}s"><span class="icon-box">${I(ic)}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></article>`).join('')}</div>
      </div>
    </section>
    <section class="section" style="padding-top:0" aria-labelledby="obszary">
      <div class="wrap">
        <div class="split-intro" style="margin-bottom:0"><div class="reveal"><span class="section-kicker">Obszary</span><h2 class="section-title" id="obszary">Pięć obszarów.<br><span class="serif">Jeden zespół.</span></h2></div></div>
        <div class="other-industries">${GROUPS.map((g) => `<a class="other-ind" href="/uslugi#g-${g.key}"><span class="icon-box">${I(g.icon)}</span><span><b>${esc(g.name)}</b><small>${esc(g.tag)}</small></span>${I('arrow-up-right')}</a>`).join('')}</div>
      </div>
    </section>
    ${ctaBand()}`,
  });
}

export function renderContact(topic) {
  const t = contactTopics().includes(topic) ? topic : 'Bezpłatna wycena';
  return render('site/contact', {
    path: '/kontakt',
    title: 'Kontakt — porozmawiajmy o Twoich klientach | VELIO',
    description: 'Napisz do VELIO: wycena strony, kampanii, SEO, automatyzacji AI lub stałej współpracy. Odpowiadamy z konkretnym zakresem.',
    bodyClass: 'subpage',
    topic: t,
    jsonld: [breadcrumbLd([['Kontakt', '/kontakt']]), { '@type': 'ContactPage', name: 'Kontakt VELIO', url: `${config.siteUrl}/kontakt` }],
    raw: { CRUMBS: crumbsHtml([['Kontakt', '/kontakt']]) },
  });
}

export function renderFaq() {
  const general = faqPairs();
  const extra = [
    ['Czy mogę kupić usługę bezpośrednio na stronie?', 'Nie. Strona służy do poznania oferty i kontaktu. Zakres, cenę i termin zawsze potwierdzamy indywidualnie przed rozpoczęciem prac.'],
    ['Co daje panel klienta?', 'Po rozpoczęciu współpracy logujesz się do panelu (e-mailem lub kontem Google). Widzisz etap i postęp projektu, kamienie milowe, dokumenty, faktury oraz zgłaszasz zmiany i pytania.'],
    ['Czy mogę zalogować się kontem Google?', 'Tak. Na stronie logowania wybierz „Kontynuuj z Google”. Jeśli wolisz klasyczne logowanie, załóż konto e-mailem i hasłem.'],
  ];
  const svc = services().flatMap((s) => (s.faq || []).slice(0, 1).map((f) => [f.q, f.a, s]));
  const all = [...general, ...extra];
  return page('/faq', {
    title: 'FAQ — najczęstsze pytania o współpracę | VELIO',
    description: 'Ceny, budżet reklamowy, czas realizacji, rozliczenia, abonamenty i panel klienta — odpowiedzi na najczęstsze pytania o współpracę z VELIO.',
    crumbs: [['FAQ', '/faq']],
    jsonld: [faqJsonLd([...all, ...svc.map(([q, a]) => [q, a])])],
    content: `${pageHero({ crumbs: [['FAQ', '/faq']], kicker: 'FAQ', title: 'Konkretne pytania.', serif: 'Konkretne odpowiedzi.', lead: 'Nie znalazłeś odpowiedzi? Napisz — odpowiemy na każde pytanie o zakres, technologię i współpracę.' })}
    <section class="section" style="padding-top:40px">
      <div class="wrap faq-grid">
        <div class="faq-side reveal">
          <span class="section-kicker">Współpraca</span>
          <h2 class="section-title">Ceny, terminy<br><span class="serif">i rozliczenia.</span></h2>
          <a class="button button-dark" href="/kontakt" data-open-contact>${I('message-square')} Zadaj pytanie</a>
        </div>
        <div class="faq-list reveal" style="--d:.1s">${faqHtml(all)}</div>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap faq-grid">
        <div class="faq-side reveal">
          <span class="section-kicker">Usługi</span>
          <h2 class="section-title">Pytania<br><span class="serif">o usługi.</span></h2>
          <a class="button button-light" href="/uslugi">${I('layout-grid')} Wszystkie usługi</a>
        </div>
        <div class="faq-list reveal" style="--d:.1s">${svc.map(([q, a, s]) => `<details><summary>${esc(q)} <small class="faq-tag">${esc(s.name)}</small><span class="faq-plus">${I('plus')}</span></summary><p>${esc(a)} <a class="link-arrow" href="/uslugi/${s.slug}">Więcej o usłudze ${I('arrow-up-right')}</a></p></details>`).join('')}</div>
      </div>
    </section>
    ${ctaBand()}`,
  });
}

export function renderQuote() {
  return render('site/quote', {
    path: '/wycena',
    title: 'Bezpłatna wycena — strona, kampania, SEO lub automatyzacja | VELIO',
    description: 'Odpowiedz na kilka pytań o cel, firmę, usługi i budżet. Zaproponujemy pakiet na start i przygotujemy wycenę z rozpisanym zakresem.',
    bodyClass: 'subpage quote-page',
    jsonld: [breadcrumbLd([['Wycena', '/wycena']])],
    raw: { CRUMBS: crumbsHtml([['Wycena', '/wycena']]) },
  });
}

// ------------------------------------------------------------------
// Strony prawne
// ------------------------------------------------------------------
export function renderLegal(kind) {
  const view = kind === 'regulamin' ? 'site/terms' : 'site/privacy';
  const title = kind === 'regulamin' ? 'Regulamin' : 'Polityka prywatności';
  const p = kind === 'regulamin' ? '/regulamin' : '/polityka-prywatnosci';
  const c = company();
  return render(view, {
    path: p,
    title: `${title} — VELIO`,
    description: kind === 'regulamin' ? 'Regulamin serwisu VELIO i panelu klienta.' : 'Zasady przetwarzania danych osobowych i plików cookies w serwisie VELIO.',
    bodyClass: 'subpage',
    jsonld: [breadcrumbLd([[title, p]])],
    raw: {
      CRUMBS: crumbsHtml([[title, p]]),
      ADMIN_DATA: esc([c.legalName || 'VELIO', c.address, c.nip ? `NIP ${c.nip}` : ''].filter(Boolean).join(', ')),
      CONTACT_LINK: c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : 'formularz na stronie <a href="/kontakt">/kontakt</a>',
      GOOGLE_NOTE: googleEnabled() ? '<li><strong>Logowanie przez Google</strong> — jeśli wybierzesz „Kontynuuj z Google”, otrzymujemy od Google Twoje imię i nazwisko, adres e-mail i identyfikator konta. Nie otrzymujemy hasła do konta Google.</li>' : '',
    },
  });
}

// ------------------------------------------------------------------
// SEO: sitemap i robots
// ------------------------------------------------------------------
const BUILD_DATE = new Date().toISOString().slice(0, 10);
export function sitemapXml() {
  const urls = [
    ['/', '1.0', 'weekly'],
    ['/uslugi', '0.9', 'weekly'],
    ...services().map((s) => [`/uslugi/${s.slug}`, '0.8', 'monthly']),
    ['/pakiety', '0.9', 'monthly'],
    ['/abonamenty', '0.8', 'monthly'],
    ['/wycena', '0.8', 'monthly'],
    ['/o-nas', '0.6', 'monthly'],
    ['/kontakt', '0.7', 'yearly'],
    ['/faq', '0.6', 'monthly'],
    ['/regulamin', '0.2', 'yearly'],
    ['/polityka-prywatnosci', '0.2', 'yearly'],
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(([p, pr, cf]) => `  <url><loc>${config.siteUrl}${p}</loc><lastmod>${BUILD_DATE}</lastmod><changefreq>${cf}</changefreq><priority>${pr}</priority></url>`).join('\n')}
</urlset>
`;
}

export function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /panel
Disallow: /admin
Disallow: /api/
Disallow: /logowanie
Disallow: /rejestracja
Disallow: /reset-hasla

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

export const registrationOpen = () => flag('allow_registration');
