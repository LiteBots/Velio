import fs from 'node:fs';
import path from 'node:path';
import { ROOT, config, googleEnabled } from '../config.js';
import { company, flag, sameAs, tracking, setting } from '../lib/settings.js';
import {
  GROUPS, services, service, packages, plans, faqs, iconFor, servicePrice, packagePrice, planPrice, contactTopics, pln,
} from './catalog.js';
import {
  priceItems, posts, post, cases, caseBySlug, reviews, locals, localBySlug, seoFor, minItemPrice, pairs, markdown, toc, plainText, slugify,
} from './content.js';

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

/** Firma jako ProfessionalService (LocalBusiness) — jeden węzeł @id używany na wszystkich stronach. */
function orgJsonLd() {
  const c = company();
  const addr = c.city || c.street ? {
    '@type': 'PostalAddress',
    ...(c.hideAddress ? {} : { streetAddress: c.street || undefined, postalCode: c.postal || undefined }),
    addressLocality: c.city || undefined, addressRegion: 'pomorskie', addressCountry: 'PL',
  } : undefined;
  const hours = String(c.hoursSchema || '').split(/[;,\n]/).map((x) => x.trim()).filter(Boolean);
  return {
    '@type': ['ProfessionalService', 'Organization'],
    '@id': `${config.siteUrl}/#organization`,
    name: 'VELIO',
    alternateName: 'VELIO Agency',
    legalName: c.legalName && c.legalName !== 'VELIO' ? c.legalName : undefined,
    description: 'Agencja marketingowa ze Słupska: strony internetowe, wizytówki Google, SEO, reklamy Google i Meta, social media, automatyzacje AI i branding.',
    url: `${config.siteUrl}/`,
    logo: `${config.siteUrl}/assets/img/icon-512.png`,
    image: `${config.siteUrl}/assets/img/og-image.png`,
    email: c.email || undefined,
    telephone: c.phone || undefined,
    taxID: c.nip || undefined,
    address: addr,
    geo: c.geo ? { '@type': 'GeoCoordinates', latitude: c.geo.lat, longitude: c.geo.lng } : undefined,
    areaServed: c.areaServed.map((a) => (/polsk/i.test(a) ? { '@type': 'Country', name: 'Polska' } : /pomorze|pomorskie/i.test(a) ? { '@type': 'State', name: 'województwo pomorskie' } : { '@type': 'City', name: a })),
    openingHours: hours.length ? hours : undefined,
    priceRange: '$$',
    currenciesAccepted: 'PLN',
    sameAs: sameAs().length ? sameAs() : undefined,
    hasMap: c.gbpUrl || undefined,
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

/** NAP w stopce — dane identyczne jak w wizytówce Google. */
function footerNap() {
  const c = company();
  const rows = [];
  if (c.publicAddress) rows.push(`<span>${I('map-pin')} ${esc(c.publicAddress)}</span>`);
  if (c.phone) rows.push(`<a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${I('phone')} ${esc(c.phone)}</a>`);
  if (c.email) rows.push(`<a href="mailto:${esc(c.email)}">${I('mail')} ${esc(c.email)}</a>`);
  if (c.hours) rows.push(`<span>${I('clock-3')} ${esc(c.hours)}</span>`);
  const social = [['facebook', c.social.facebook], ['instagram', c.social.instagram], ['linkedin', c.social.linkedin], ['map-pin', c.gbpUrl]]
    .filter(([, u]) => /^https?:\/\//.test(u || ''))
    .map(([ic, u]) => `<a class="social-link" href="${esc(u)}" target="_blank" rel="noopener" aria-label="${ic === 'map-pin' ? 'Wizytówka Google' : ic}">${I(ic)}</a>`).join('');
  return `<address class="footer-nap"><b>VELIO${c.legalName && c.legalName !== 'VELIO' ? ` · ${esc(c.legalName)}` : ''}</b>${rows.join('')}${social ? `<span class="footer-social">${social}</span>` : ''}</address>`;
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
function headExtra(vars) {
  const out = [];
  const g = setting('google_site_verification'), b = setting('bing_site_verification');
  if (g) out.push(`<meta name="google-site-verification" content="${esc(g)}">`);
  if (b) out.push(`<meta name="msvalidate.01" content="${esc(b)}">`);
  if (vars.ogType === 'article' && vars.published) out.push(`<meta property="article:published_time" content="${esc(vars.published)}">`);
  const t = tracking();
  if (!vars.noTracking && (t.gtm || t.ga4)) out.push(`<script src="/assets/js/consent.js?v=${config.version}" data-gtm="${esc(t.gtm)}" data-ga4="${esc(t.ga4)}"></script>`);
  out.push('<link rel="alternate" type="application/rss+xml" title="Blog VELIO" href="/blog/rss.xml">');
  return out.join('\n  ');
}

const absUrl = (u) => (/^https?:\/\//.test(u) ? u : `${config.siteUrl}${u.startsWith('/') ? '' : '/'}${u}`);

export function render(view, vars = {}) {
  const canonical = `${config.siteUrl}${vars.path ?? '/'}`;
  const c = company();
  const o = vars.path ? seoFor(vars.path) : null; // nadpisania z /admin/seo
  const title = o?.title || vars.title || 'Agencja marketingowa Słupsk — strony, SEO, reklamy | VELIO';
  const robots = o?.noindex ? 'noindex, follow' : (vars.robots || 'index, follow, max-image-preview:large');
  const base = {
    TITLE: esc(title),
    DESCRIPTION: esc(o?.description || vars.description || ''),
    CANONICAL: canonical,
    ROBOTS: robots,
    OG_TYPE: vars.ogType || 'website',
    OG_IMAGE: esc(absUrl(o?.og_image || vars.ogImage || '/assets/img/og-image.png')),
    OG_ALT: esc(title),
    HEAD_EXTRA: headExtra(vars),
    FOOTER_NAP: footerNap(),
    FOOTER_LOCALS: locals().filter((l) => !l.service).map((l) => `<a href="/${l.slug}">${esc(l.city || l.h1)}</a>`).join(''),
    COOKIE_LINK: (tracking().gtm || tracking().ga4) ? '<a href="#cookies" data-cookie-settings>Ustawienia cookies</a>' : '',
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
    CFG_SERVICES: services().map((s) => `<label class="choice"><input type="checkbox" value="${esc(s.name)}" data-slug="${s.slug}" data-min="${minItemPrice(s.slug) || (s.pricing?.kind === 'from' ? s.pricing.amount : '')}"><span><b>${esc(s.name)}</b><span>${esc(s.summary)}</span></span></label>`).join(''),
    CFG_PACKAGES: esc(JSON.stringify(packages().map((p) => ({ slug: p.slug, name: p.name, priceFrom: p.priceFrom, unit: p.priceUnit })))),
  };
  const all = { ...base, ...(vars.raw || {}) };
  let html = readView(view);
  html = html.replace(/\{\{([A-Z_]+)\}\}/g, (_, k) => (k in all ? all[k] : ''));
  html = html.replace(/<i data-lucide="([\w-]+)"(?: class="([^"]*)")?><\/i>/g, (_, n, cl) => iconSvg(n, cl));
  return html;
}

/** Podstrona w ogólnym szablonie (nagłówek, treść, stopka, konfigurator wyceny). */
function page(p, { title, description, crumbs, jsonld = [], content, bodyClass = 'subpage', topic, ogType, ogImage, published }) {
  return render('site/page', {
    path: p, title, description, bodyClass, topic, ogType, ogImage, published,
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
  const minPrice = minItemPrice() || Math.min(...pk.filter((p) => p.priceFrom).map((p) => p.priceFrom));
  return render('site/index', {
    path: '/',
    title: 'Agencja marketingowa Słupsk — strony, SEO, reklamy | VELIO',
    description: 'Agencja marketingowa ze Słupska: strony internetowe, wizytówki Google, SEO, reklamy Google i Meta, social media i AI. Bez minimum zamówienia.',
    jsonld: [
      { '@type': 'WebSite', '@id': `${config.siteUrl}/#website`, url: config.siteUrl, name: 'VELIO', inLanguage: 'pl-PL', publisher: { '@id': `${config.siteUrl}/#organization` } },
      {
        '@id': `${config.siteUrl}/#organization`,
        hasOfferCatalog: {
          '@type': 'OfferCatalog', name: 'Usługi VELIO',
          itemListElement: services().map((sv) => ({ '@type': 'Offer', itemOffered: { '@type': 'Service', name: sv.name, url: `${config.siteUrl}/uslugi/${sv.slug}` }, ...(sv.pricing?.kind === 'from' ? { priceSpecification: { '@type': 'PriceSpecification', minPrice: sv.pricing.amount, priceCurrency: 'PLN' } } : {}) })),
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
      HOME_EXTRA: homeExtra(),
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
  const items = priceItems().filter((i) => i.service === s.slug);
  const priced = items.filter((i) => Number(i.price) > 0);
  const relPosts = posts().filter((x) => (x.services || []).includes(s.slug)).slice(0, 3);
  const relCases = cases().filter((x) => (x.services || []).includes(s.slug)).slice(0, 3);
  const relLocals = locals().filter((l) => l.service === s.slug);
  const offers = priced.length
    ? { '@type': 'AggregateOffer', priceCurrency: 'PLN', lowPrice: Math.min(...priced.map((i) => i.price)), highPrice: Math.max(...priced.map((i) => i.price)), offerCount: priced.length }
    : s.pricing?.kind === 'from' && s.pricing.amount ? { '@type': 'Offer', price: String(s.pricing.amount), priceCurrency: 'PLN' } : undefined;
  const title = s.seo?.title || s.name;
  return page(p, {
    title: title.length > 50 ? title : `${title} | VELIO`,
    description: s.seo?.description || s.summary,
    crumbs: [['Usługi', '/uslugi'], [s.name, p]],
    topic: s.name,
    jsonld: [
      {
        '@type': 'Service', '@id': `${config.siteUrl}${p}#service`, name: s.name, serviceType: s.name, description: s.summary, url: `${config.siteUrl}${p}`,
        provider: { '@id': `${config.siteUrl}/#organization` },
        areaServed: [{ '@type': 'City', name: 'Słupsk' }, { '@type': 'State', name: 'województwo pomorskie' }, { '@type': 'Country', name: 'Polska' }],
        ...(offers ? { offers } : {}),
        ...(items.length ? { hasOfferCatalog: { '@type': 'OfferCatalog', name: `Cennik: ${s.name}`, itemListElement: items.map((i) => ({ '@type': 'Offer', name: i.name, description: i.note || undefined, priceCurrency: 'PLN', ...(Number(i.price) > 0 ? { priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: i.price, priceCurrency: 'PLN', unitText: i.unit || undefined } } : {}) })) } } : {}),
      },
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

    ${s.content ? `<section class="section" style="padding-top:0"><div class="wrap"><article class="prose reveal">${markdown(s.content)}</article></div></section>` : ''}

    ${items.length ? `<section class="section" style="padding-top:0" aria-labelledby="cennik-title" id="cennik">
      <div class="wrap">
        <div class="split-intro" style="margin-bottom:28px">
          <div class="reveal"><span class="section-kicker">Cennik</span><h2 class="section-title" id="cennik-title">Zamów tylko to,<br><span class="serif">czego potrzebujesz.</span></h2></div>
          <p class="reveal" style="--d:.1s">Bez minimalnej kwoty i bez obowiązkowego pakietu. Ceny „od” są netto, a dokładną kwotę potwierdzamy po krótkiej rozmowie. <a class="link-arrow" href="/cennik">Pełny cennik ${I('arrow-up-right')}</a></p>
        </div>
        ${priceTable(items, s)}
      </div>
    </section>` : ''}

    ${relCases.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Realizacje</span><div class="case-grid" style="margin-top:22px">${relCases.map(caseCard).join('')}</div></div></section>` : ''}

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

    ${relPosts.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Z bloga</span><div class="post-grid" style="margin-top:22px">${relPosts.map(postCard).join('')}</div></div></section>` : ''}

    ${ctaBand(`Wyceńmy: ${s.name.toLowerCase()}.`, 'Opisz cel w kilku zdaniach. Odpowiemy z zakresem i ceną.')}

    ${relLocals.length ? `<section class="section" style="padding-top:0;padding-bottom:0"><div class="wrap"><p class="local-links">${I('map-pin')} ${esc(s.name)} lokalnie: ${relLocals.map((l) => `<a href="/${l.slug}">${esc(l.city || l.h1)}</a>`).join(' · ')}</p></div></section>` : ''}

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
    title: 'Pakiety marketingowe na start | VELIO',
    description: `Pakiety VELIO: ${pk.map((p) => p.name).join(', ')}. Jasny zakres, ograniczenia i koszty zewnętrzne opisane przed startem.`,
    crumbs: [['Pakiety', '/pakiety']],
    jsonld: [{ '@type': 'OfferCatalog', name: 'Pakiety VELIO', itemListElement: pk.map((p) => ({ '@type': 'Offer', name: p.name, description: p.description, ...(p.priceFrom ? { price: String(p.priceFrom), priceCurrency: 'PLN' } : {}) })) }],
    content: `${pageHero({
      crumbs: [['Pakiety', '/pakiety']], kicker: 'Pakiety', title: 'Punkt startu.', serif: 'Bez gwiazdek drobnym drukiem.',
      lead: 'Pakiety to gotowe zestawy dla firm, które chcą zrobić kilka rzeczy naraz. Nie są obowiązkowe: każdą usługę możesz zamówić osobno, a większość projektów i tak wyceniamy indywidualnie.',
      actions: `<a class="button button-coral" href="/wycena" data-open-config>${I('wand-sparkles')} Dobierz pakiet</a><a class="button button-ghost" href="/cennik">${I('receipt-text')} Pojedyncze usługi</a>`,
    })}
    <div class="wrap"><a class="related-plan reveal" href="/cennik"><span class="icon-box">${I('receipt-text')}</span><span><b>Potrzebujesz jednej rzeczy?</b><small>Wizytówka Google od ${pln(minItemPrice('wizytowka-google') || 299)}, logo, grafiki, poprawki na stronie: zamówisz bez pakietu i bez minimum.</small></span>${I('arrow-up-right')}</a></div>
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
export const FOUNDER = { name: 'Gracjan Błachnio', role: 'założyciel, programista i specjalista ds. marketingu internetowego' };

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
    title: 'O nas — agencja marketingowa ze Słupska | VELIO',
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
    <section class="section" style="padding-top:0" aria-labelledby="kto">
      <div class="wrap about-team">
        <div class="reveal">
          <span class="section-kicker">Kto stoi za VELIO</span>
          <h2 class="section-title" id="kto">Ludzie,<br><span class="serif">nie call center.</span></h2>
          <p>VELIO prowadzi <b>${esc(FOUNDER.name)}</b>, ${esc(FOUNDER.role)}. Na co dzień projektuje i programuje strony, panele i automatyzacje, a także prowadzi kampanie dla firm z Pomorza. Przy większych projektach pracujemy z zaufanymi specjalistami: grafikami, copywriterami i fotografami.</p>
          <p style="margin-top:12px">Rozmawiasz bezpośrednio z osobą, która robi Twój projekt. Bez przekazywania wiadomości przez opiekuna klienta.</p>
        </div>
        <div class="about-card reveal" style="--d:.1s">
          <div class="board-head"><b>Obszar działania</b><span>NA MIEJSCU I ZDALNIE</span></div>
          <ul class="area-list">${company().areaServed.map((a) => `<li>${I('map-pin')} ${esc(a)}</li>`).join('')}</ul>
          <div class="local-links" style="margin-top:16px">${locals().filter((l) => !l.service).map((l) => `<a href="/${l.slug}">${esc(l.city)}</a>`).join(' · ')}</div>
          ${footerNap()}
        </div>
      </div>
    </section>
    ${ctaBand()}`,
  });
}

function contactInfo() {
  const c = company();
  const map = /^https:\/\/(www\.)?google\.com\/maps\/embed/.test(c.mapsEmbed || '')
    ? `<div class="map-embed"><iframe src="${esc(c.mapsEmbed)}" title="Mapa dojazdu — VELIO" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : '';
  const rows = [
    ['building-2', 'Firma', [c.legalName || 'VELIO', c.nip ? `NIP ${c.nip}` : ''].filter(Boolean).join(' · ')],
    ['map-pin', c.hideAddress ? 'Siedziba' : 'Adres', c.publicAddress],
    ['phone', 'Telefon', c.phone ? `<a href="tel:${esc(c.phone.replace(/\s+/g, ''))}">${esc(c.phone)}</a>` : '', true],
    ['mail', 'E-mail', c.email ? `<a href="mailto:${esc(c.email)}">${esc(c.email)}</a>` : '', true],
    ['clock-3', 'Godziny pracy', c.hours],
    ['compass', 'Obszar działania', c.areaServed.join(', ')],
  ].filter((r) => r[2]);
  return `<section class="section" style="padding-top:40px;padding-bottom:0" aria-labelledby="dane-title">
    <div class="wrap contact-info-grid${map ? '' : ' single'}">
      <div class="about-card reveal">
        <h2 id="dane-title" class="card-title">Dane kontaktowe</h2>
        <dl class="nap-list">${rows.map(([ic, k, v, rawHtml]) => `<div><dt>${I(ic)} ${esc(k)}</dt><dd>${rawHtml ? v : esc(v)}</dd></div>`).join('')}</dl>
        ${c.gbpUrl ? `<a class="button button-light button-small" href="${esc(c.gbpUrl)}" target="_blank" rel="noopener" style="margin-top:18px">${I('map-pin')} Zobacz nas w Google</a>` : ''}
      </div>
      ${map ? `<div class="reveal" style="--d:.1s">${map}</div>` : ''}
    </div>
  </section>`;
}

export function renderContact(topic) {
  const t = contactTopics().includes(topic) ? topic : 'Bezpłatna wycena';
  return render('site/contact', {
    path: '/kontakt',
    title: 'Kontakt — agencja marketingowa Słupsk | VELIO',
    description: 'Kontakt z VELIO, agencją marketingową ze Słupska: telefon, e-mail, formularz i bezpłatna wycena strony, SEO, reklam lub wizytówki Google.',
    bodyClass: 'subpage',
    topic: t,
    jsonld: [breadcrumbLd([['Kontakt', '/kontakt']]), { '@type': 'ContactPage', name: 'Kontakt VELIO', url: `${config.siteUrl}/kontakt`, about: { '@id': `${config.siteUrl}/#organization` } }],
    raw: { CRUMBS: crumbsHtml([['Kontakt', '/kontakt']]), CONTACT_INFO: contactInfo() },
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
// Karty i elementy wspólne nowych podstron
// ------------------------------------------------------------------
const fmtDatePl = (d) => (d ? new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${d}T12:00:00`)) : '');
const readMinutes = (md) => Math.max(1, Math.round(plainText(md).split(' ').length / 180));
const catSlug = (c) => slugify(c || 'inne');

function postCard(x, i = 0) {
  return `<a class="post-card reveal" style="--d:${(i % 3) * 0.05}s" href="/blog/${x.slug}">
    <span class="post-meta"><span class="pill">${esc(x.category || 'Blog')}</span><span>${esc(fmtDatePl(x.published_at))} · ${readMinutes(x.body)} min</span></span>
    <h3>${esc(x.title)}</h3>
    <p>${esc(x.excerpt || '')}</p>
    <span class="link-arrow">Czytaj ${I('arrow-up-right')}</span>
  </a>`;
}

function caseCard(x, i = 0) {
  const res = pairs(x.results).slice(0, 2);
  return `<a class="case-card reveal" style="--d:${(i % 3) * 0.05}s" href="/realizacje/${x.slug}">
    <span class="post-meta"><span class="pill">${esc(x.industry || 'Realizacja')}</span>${x.city ? `<span>${I('map-pin')} ${esc(x.city)}</span>` : ''}</span>
    <h3>${esc(x.title)}</h3>
    <p>${esc(x.summary || '')}</p>
    ${res.length ? `<div class="case-results">${res.map(([k, v]) => `<span><b>${esc(v || '')}</b><small>${esc(k)}</small></span>`).join('')}</div>` : ''}
    <span class="link-arrow">Zobacz realizację ${I('arrow-up-right')}</span>
  </a>`;
}

const stars = (n) => `<span class="stars" aria-label="Ocena ${n} na 5">${'★'.repeat(Math.max(0, Math.min(5, Math.round(n || 0))))}<span class="off">${'★'.repeat(5 - Math.max(0, Math.min(5, Math.round(n || 0))))}</span></span>`;
function reviewCard(r, i = 0) {
  return `<figure class="review-card reveal" style="--d:${(i % 3) * 0.05}s">
    ${r.rating ? stars(r.rating) : ''}
    <blockquote><p>${esc(r.text)}</p></blockquote>
    <figcaption><b>${esc(r.author)}</b>${r.company || r.city ? `<small>${esc([r.company, r.city].filter(Boolean).join(', '))}</small>` : ''}${r.source === 'google' ? `<span class="pill">Google</span>` : ''}</figcaption>
  </figure>`;
}

function priceTable(items, svc) {
  return `<div class="price-table reveal">${items.map((i) => {
    const topic = svc ? svc.name : (service(i.service)?.name || 'Bezpłatna wycena');
    const price = Number(i.price) > 0 ? `<b>od ${esc(pln(i.price))}</b><small>${esc(i.unit || 'netto')}</small>` : '<b>wycena</b><small>indywidualna</small>';
    return `<div class="price-row${i.popular ? ' popular' : ''}">
      <div class="price-name"><h3>${esc(i.name)}${i.popular ? ' <span class="pill">często wybierane</span>' : ''}</h3>${i.note ? `<p>${esc(i.note)}</p>` : ''}</div>
      <div class="price-val">${price}</div>
      <a class="button button-light button-small" href="/kontakt?temat=${encodeURIComponent(topic)}" data-open-contact data-contact-type="${esc(topic)}" data-contact-msg="${esc(`Interesuje mnie: ${i.name}`)}" aria-label="Zapytaj o: ${esc(i.name)}">${I('message-square')} Zapytaj</a>
    </div>`;
  }).join('')}</div>`;
}

function homeExtra() {
  const cs = cases().slice(0, 3), ps = posts().slice(0, 3), rv = reviews().slice(0, 3);
  const popular = priceItems().filter((i) => i.popular).slice(0, 4);
  return `
    ${popular.length ? `<section class="section" style="padding-top:0" aria-labelledby="cennik-home">
      <div class="wrap">
        <div class="split-intro" style="margin-bottom:28px">
          <div class="reveal"><span class="section-kicker">Bez minimum</span><h2 class="section-title" id="cennik-home">Jedna drobna usługa?<br><span class="serif">Też ją zrobimy.</span></h2></div>
          <p class="reveal" style="--d:.1s">Nie musisz kupować pakietu. Wizytówka Google, logo, grafiki czy poprawki na stronie mają swoje ceny „od”, a większe projekty wyceniamy indywidualnie. <a class="link-arrow" href="/cennik">Cały cennik ${I('arrow-up-right')}</a></p>
        </div>
        ${priceTable(popular)}
      </div>
    </section>` : ''}
    ${cs.length ? `<section class="section" style="padding-top:0" aria-labelledby="real-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Realizacje</span><h2 class="section-title" id="real-home">Co już<br><span class="serif">zbudowaliśmy.</span></h2></div><p class="reveal"><a class="link-arrow" href="/realizacje">Wszystkie realizacje ${I('arrow-up-right')}</a></p></div>
      <div class="case-grid">${cs.map(caseCard).join('')}</div></div></section>` : ''}
    ${rv.length ? `<section class="section" style="padding-top:0" aria-labelledby="op-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Opinie</span><h2 class="section-title" id="op-home">Co mówią<br><span class="serif">klienci.</span></h2></div><p class="reveal"><a class="link-arrow" href="/opinie">Wszystkie opinie ${I('arrow-up-right')}</a></p></div>
      <div class="review-grid">${rv.map(reviewCard).join('')}</div></div></section>` : ''}
    ${ps.length ? `<section class="section" style="padding-top:0" aria-labelledby="blog-home"><div class="wrap">
      <div class="split-intro" style="margin-bottom:28px"><div class="reveal"><span class="section-kicker">Blog</span><h2 class="section-title" id="blog-home">Poradniki<br><span class="serif">bez żargonu.</span></h2></div><p class="reveal"><a class="link-arrow" href="/blog">Wszystkie wpisy ${I('arrow-up-right')}</a></p></div>
      <div class="post-grid">${ps.map(postCard).join('')}</div></div></section>` : ''}`;
}

// ------------------------------------------------------------------
// Cennik pojedynczych usług
// ------------------------------------------------------------------
export function renderPricing() {
  const items = priceItems();
  const groups = services().map((sv) => ({ sv, list: items.filter((i) => i.service === sv.slug) })).filter((g) => g.list.length);
  const other = items.filter((i) => !service(i.service));
  const faq = [
    ['Czy jest minimalna kwota zamówienia?', 'Nie. Możesz zamówić jedną drobną usługę, np. założenie wizytówki Google albo projekt wizytówek, bez kupowania pakietu.'],
    ['Czy ceny są ostateczne?', 'To ceny „od” dla typowego zakresu. Ostateczną kwotę podajemy w wycenie po krótkiej rozmowie, zanim zaczniemy pracę.'],
    ['Czy ceny zawierają VAT?', 'Wszystkie ceny są netto. Do faktury doliczamy VAT według obowiązującej stawki.'],
    ['Co nie jest wliczone?', 'Budżet reklamowy (płacisz go bezpośrednio Google lub Meta), licencje płatnych narzędzi, druk i produkty z nadrukiem. Zawsze wykazujemy je osobno.'],
  ];
  return page('/cennik', {
    title: 'Cennik usług marketingowych — bez minimum | VELIO',
    description: 'Cennik VELIO: wizytówka Google od 299 zł, strona wizytówka od 990 zł, logo od 690 zł, kampanie i SEO. Każdą usługę zamówisz osobno, bez pakietu.',
    crumbs: [['Cennik', '/cennik']],
    jsonld: [
      { '@type': 'OfferCatalog', name: 'Cennik usług VELIO', url: `${config.siteUrl}/cennik`, itemListElement: items.map((i) => ({ '@type': 'Offer', name: i.name, description: i.note || undefined, seller: { '@id': `${config.siteUrl}/#organization` }, itemOffered: { '@type': 'Service', name: i.name }, priceCurrency: 'PLN', ...(Number(i.price) > 0 ? { priceSpecification: { '@type': 'UnitPriceSpecification', minPrice: i.price, priceCurrency: 'PLN', valueAddedTaxIncluded: false, unitText: i.unit || undefined } } : {}) })) },
      faqJsonLd(faq),
    ],
    content: `${pageHero({
      crumbs: [['Cennik', '/cennik']], kicker: 'Cennik', title: 'Płacisz za to,', serif: 'czego potrzebujesz.',
      lead: 'Bez minimalnej kwoty i bez obowiązkowych pakietów. Poniżej są ceny „od” dla typowego zakresu. Większość projektów wyceniamy indywidualnie, zawsze przed rozpoczęciem pracy.',
      actions: `<a class="button button-coral" href="/wycena" data-open-config>${I('wand-sparkles')} Bezpłatna wycena</a><a class="button button-ghost" href="/pakiety">${I('package')} Pakiety na start</a>`,
    })}
    <section class="section" style="padding-top:30px">
      <div class="wrap">
        <nav class="chip-nav reveal" aria-label="Sekcje cennika">${groups.map((g) => `<a href="#${g.sv.slug}">${esc(g.sv.name)}</a>`).join('')}</nav>
        ${groups.map((g) => `<div class="price-group" id="${g.sv.slug}">
          <div class="price-group-head reveal"><span class="icon-box">${I(iconFor(g.sv))}</span><h2>${esc(g.sv.name)}</h2><a class="link-arrow" href="/uslugi/${g.sv.slug}">O usłudze ${I('arrow-up-right')}</a></div>
          ${priceTable(g.list, g.sv)}
        </div>`).join('')}
        ${other.length ? `<div class="price-group"><div class="price-group-head"><h2>Inne</h2></div>${priceTable(other)}</div>` : ''}
        <p class="contact-only">${I('info')} Ceny netto. Budżet reklamowy, licencje narzędzi i druk rozliczane osobno. Nie widzisz swojej usługi? <a class="link-arrow" href="/kontakt" data-open-contact>Napisz ${I('arrow-up-right')}</a></p>
      </div>
    </section>
    <section class="section" style="padding-top:0">
      <div class="wrap two-links">
        <a class="related-plan reveal" href="/pakiety"><span class="icon-box">${I('package')}</span><span><b>Pakiety na start</b><small>Kilka usług naraz w jednej cenie: strona, wizytówka, kampania i pomiar.</small></span>${I('arrow-up-right')}</a>
        <a class="related-plan reveal" href="/abonamenty"><span class="icon-box">${I('repeat')}</span><span><b>Stała współpraca</b><small>Opieka nad stroną, SEO, reklamy i social media w abonamencie.</small></span>${I('arrow-up-right')}</a>
      </div>
    </section>
    <section class="section" style="padding-top:0"><div class="wrap faq-grid">
      <div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Pytania<br><span class="serif">o ceny.</span></h2></div>
      <div class="faq-list reveal">${faqHtml(faq)}</div>
    </div></section>
    ${ctaBand('Nie wiesz, ile to będzie kosztować?', 'Opisz, czego potrzebujesz. Odpowiemy z konkretną kwotą.')}`,
  });
}

// ------------------------------------------------------------------
// Blog
// ------------------------------------------------------------------
export const BLOG_CATEGORIES = ['SEO', 'Reklamy Google i Meta', 'Strony WWW', 'AI i automatyzacje', 'Social media', 'Marketing lokalny'];

export function renderBlog(cat = '') {
  const all = posts();
  const category = cat ? BLOG_CATEGORIES.find((c) => catSlug(c) === cat) : '';
  if (cat && !category) return null;
  const list = category ? all.filter((x) => x.category === category) : all;
  const p = category ? `/blog/kategoria/${cat}` : '/blog';
  const crumbs = category ? [['Blog', '/blog'], [category, p]] : [['Blog', '/blog']];
  const used = new Set(all.map((x) => x.category));
  return page(p, {
    title: category ? `${category} — poradniki | Blog VELIO` : 'Blog o marketingu dla firm lokalnych | VELIO',
    description: category ? `Wpisy z kategorii ${category}: praktyczne poradniki dla małych i średnich firm.` : 'Poradniki o stronach internetowych, SEO, wizytówce Google, reklamach Google i Meta, social mediach i AI dla firm. Konkretnie i bez żargonu.',
    crumbs,
    jsonld: [{ '@type': 'Blog', name: 'Blog VELIO', url: `${config.siteUrl}/blog`, publisher: { '@id': `${config.siteUrl}/#organization` }, blogPost: list.slice(0, 20).map((x) => ({ '@type': 'BlogPosting', headline: x.title, url: `${config.siteUrl}/blog/${x.slug}`, datePublished: x.published_at })) }],
    content: `${pageHero({ crumbs, kicker: category || 'Blog', title: category ? `${category}.` : 'Marketing', serif: category ? 'Poradniki.' : 'po ludzku.', lead: 'Praktyczne poradniki dla właścicieli firm: ile co kosztuje, jak zacząć i czego unikać.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <nav class="chip-nav reveal" aria-label="Kategorie bloga"><a href="/blog"${!category ? ' aria-current="page"' : ''}>Wszystkie</a>${BLOG_CATEGORIES.filter((c) => used.has(c)).map((c) => `<a href="/blog/kategoria/${catSlug(c)}"${c === category ? ' aria-current="page"' : ''}>${esc(c)}</a>`).join('')}</nav>
      ${list.length ? `<div class="post-grid">${list.map(postCard).join('')}</div>` : `<p class="empty-note">Wkrótce pojawią się tu pierwsze wpisy.</p>`}
    </div></section>
    ${ctaBand()}`,
  });
}

export function renderPost(slug) {
  const x = post(slug);
  if (!x) return null;
  const p = `/blog/${x.slug}`;
  const t = toc(x.body);
  const rel = (x.services || []).map(service).filter(Boolean);
  const more = posts().filter((y) => y.slug !== x.slug).sort((a, b) => (a.category === x.category ? -1 : 0) - (b.category === x.category ? -1 : 0)).slice(0, 3);
  const crumbs = [['Blog', '/blog'], [x.category || 'Wpis', `/blog/kategoria/${catSlug(x.category)}`], [x.title, p]];
  const author = x.author || FOUNDER.name;
  const modified = String(x.updated_at || '').slice(0, 10) || x.published_at;
  return page(p, {
    title: x.seo_title || `${x.title} | VELIO`,
    description: x.seo_description || x.excerpt,
    ogType: 'article', ogImage: x.og_image || undefined, published: x.published_at,
    crumbs,
    jsonld: [{
      '@type': 'BlogPosting', '@id': `${config.siteUrl}${p}#article`, headline: x.title, description: x.excerpt, url: `${config.siteUrl}${p}`, mainEntityOfPage: `${config.siteUrl}${p}`,
      datePublished: x.published_at, dateModified: modified, inLanguage: 'pl-PL', articleSection: x.category,
      image: absUrl(x.og_image || '/assets/img/og-image.png'), wordCount: plainText(x.body).split(' ').length,
      author: { '@type': 'Person', name: author, ...(author === FOUNDER.name ? { jobTitle: 'Założyciel VELIO', url: `${config.siteUrl}/o-nas`, worksFor: { '@id': `${config.siteUrl}/#organization` } } : {}) },
      publisher: { '@id': `${config.siteUrl}/#organization` },
    }],
    content: `
    <section class="ind-hero page-hero post-hero"><div class="wrap">
      ${crumbsHtml(crumbs)}
      <div class="reveal">
        <span class="post-meta"><a class="pill" href="/blog/kategoria/${catSlug(x.category)}">${esc(x.category || 'Blog')}</a><span>${esc(fmtDatePl(x.published_at))}</span><span>${readMinutes(x.body)} min czytania</span></span>
        <h1>${esc(x.title)}</h1>
        ${x.excerpt ? `<p class="lead-text">${esc(x.excerpt)}</p>` : ''}
        <p class="post-author">${I('user-round')} ${esc(author)}</p>
      </div>
    </div></section>
    <section class="section" style="padding-top:30px"><div class="wrap post-layout">
      <article class="prose">${markdown(x.body)}</article>
      <aside class="post-aside">
        ${t.length > 2 ? `<nav class="toc" aria-label="Spis treści"><b>Spis treści</b>${t.map((h) => `<a href="#${h.id}">${esc(h.text)}</a>`).join('')}</nav>` : ''}
        ${rel.length ? `<div class="toc"><b>Powiązane usługi</b>${rel.map((sv) => `<a href="/uslugi/${sv.slug}">${esc(sv.name)} <small>${esc(servicePrice(sv))}</small></a>`).join('')}</div>` : ''}
        <a class="button button-coral button-block" href="/wycena" data-open-config>${I('wand-sparkles')} Bezpłatna wycena</a>
      </aside>
    </div></section>
    ${more.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Czytaj dalej</span><div class="post-grid" style="margin-top:22px">${more.map(postCard).join('')}</div></div></section>` : ''}
    ${ctaBand()}`,
  });
}

export function blogRss() {
  const list = posts().slice(0, 30);
  const x = (v) => esc(v);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom"><channel>
<title>Blog VELIO</title><link>${config.siteUrl}/blog</link><description>Poradniki marketingowe dla firm</description><language>pl-PL</language>
<atom:link href="${config.siteUrl}/blog/rss.xml" rel="self" type="application/rss+xml"/>
${list.map((p) => `<item><title>${x(p.title)}</title><link>${config.siteUrl}/blog/${p.slug}</link><guid>${config.siteUrl}/blog/${p.slug}</guid><pubDate>${new Date(`${p.published_at || BUILD_DATE}T08:00:00Z`).toUTCString()}</pubDate><description>${x(p.excerpt || '')}</description><category>${x(p.category || '')}</category></item>`).join('\n')}
</channel></rss>
`;
}

// ------------------------------------------------------------------
// Realizacje
// ------------------------------------------------------------------
export function renderCases() {
  const list = cases();
  return page('/realizacje', {
    title: 'Realizacje — strony, sklepy i kampanie | VELIO',
    description: 'Realizacje VELIO: strony internetowe, sklepy, panele i kampanie dla firm z Pomorza. Problem, rozwiązanie i wyniki.',
    crumbs: [['Realizacje', '/realizacje']],
    jsonld: [{ '@type': 'CollectionPage', name: 'Realizacje VELIO', url: `${config.siteUrl}/realizacje`, hasPart: list.map((c) => ({ '@type': 'CreativeWork', name: c.title, url: `${config.siteUrl}/realizacje/${c.slug}` })) }],
    content: `${pageHero({ crumbs: [['Realizacje', '/realizacje']], kicker: 'Realizacje', title: 'Projekty,', serif: 'które pracują.', lead: 'Przy każdym projekcie opisujemy punkt wyjścia, co zrobiliśmy i jakie są efekty. Pokazujemy tylko wyniki, które da się sprawdzić.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      ${list.length ? `<div class="case-grid">${list.map(caseCard).join('')}</div>` : '<p class="empty-note">Wkrótce opiszemy tu pierwsze realizacje.</p>'}
    </div></section>
    ${ctaBand('Chcesz być następną realizacją?', 'Opowiedz o swojej firmie. Zaproponujemy plan i wycenę.')}`,
  });
}

export function renderCase(slug) {
  const x = caseBySlug(slug);
  if (!x) return null;
  const p = `/realizacje/${x.slug}`;
  const res = pairs(x.results);
  const svcs = (x.services || []).map(service).filter(Boolean);
  const crumbs = [['Realizacje', '/realizacje'], [x.client || x.title, p]];
  return page(p, {
    title: `${x.title.length > 48 ? x.client || x.title : x.title} — realizacja | VELIO`,
    description: x.summary,
    crumbs,
    jsonld: [{ '@type': 'CreativeWork', name: x.title, description: x.summary, url: `${config.siteUrl}${p}`, creator: { '@id': `${config.siteUrl}/#organization` }, ...(x.url ? { about: { '@type': 'Organization', name: x.client, url: x.url } } : {}) }],
    content: `${pageHero({ crumbs, kicker: [x.industry, x.city].filter(Boolean).join(' · ') || 'Realizacja', title: x.title, lead: x.summary, actions: x.url ? `<a class="button button-ghost" href="${esc(x.url)}" target="_blank" rel="noopener">${I('external-link')} Zobacz stronę</a>` : '' })}
    ${res.length ? `<section class="section" style="padding:20px 0 0"><div class="wrap"><div class="stats-row reveal">${res.map(([k, v]) => `<div class="stat-cell"><strong>${esc(v || '')}</strong><span>${esc(k)}</span></div>`).join('')}</div></div></section>` : ''}
    <section class="section" style="padding-top:40px"><div class="wrap post-layout">
      <article class="prose">
        ${x.problem ? `<h2>Punkt wyjścia</h2>${markdown(x.problem)}` : ''}
        ${x.solution ? `<h2>Co zrobiliśmy</h2>${markdown(x.solution)}` : ''}
      </article>
      <aside class="post-aside">
        ${svcs.length ? `<div class="toc"><b>Usługi w projekcie</b>${svcs.map((sv) => `<a href="/uslugi/${sv.slug}">${esc(sv.name)}</a>`).join('')}</div>` : ''}
        <a class="button button-coral button-block" href="/wycena" data-open-config>${I('wand-sparkles')} Wyceń podobny projekt</a>
      </aside>
    </div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// Opinie (tylko prawdziwe — dodawane w panelu)
// ------------------------------------------------------------------
export function renderReviews() {
  const list = reviews();
  const rated = list.filter((r) => Number(r.rating) > 0);
  const avg = rated.length ? Math.round((rated.reduce((a, r) => a + Number(r.rating), 0) / rated.length) * 10) / 10 : 0;
  const c = company();
  return page('/opinie', {
    title: 'Opinie klientów | VELIO — agencja marketingowa Słupsk',
    description: 'Opinie klientów o współpracy z VELIO: strony internetowe, wizytówki Google, SEO, reklamy i social media.',
    crumbs: [['Opinie', '/opinie']],
    jsonld: rated.length ? [{
      '@id': `${config.siteUrl}/#organization`,
      aggregateRating: { '@type': 'AggregateRating', ratingValue: avg, reviewCount: rated.length, bestRating: 5, worstRating: 1 },
      review: rated.slice(0, 20).map((r) => ({ '@type': 'Review', author: { '@type': 'Person', name: r.author }, reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 }, reviewBody: r.text, ...(r.date ? { datePublished: r.date } : {}) })),
    }] : [],
    content: `${pageHero({ crumbs: [['Opinie', '/opinie']], kicker: 'Opinie', title: 'Co mówią', serif: 'nasi klienci.', lead: rated.length ? `Średnia ocena ${String(avg).replace('.', ',')} / 5 z ${rated.length} ${rated.length === 1 ? 'opinii' : 'opinii'}. Publikujemy tylko prawdziwe opinie klientów.` : 'Publikujemy tylko prawdziwe opinie klientów, głównie z naszej wizytówki Google.', actions: c.gbpReviewUrl ? `<a class="button button-coral" href="${esc(c.gbpReviewUrl)}" target="_blank" rel="noopener">${I('star')} Wystaw opinię w Google</a>` : '' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      ${list.length ? `<div class="review-grid">${list.map(reviewCard).join('')}</div>` : `<p class="empty-note">Zbieramy pierwsze opinie.${c.gbpUrl ? ` Zobacz nasz <a class="link-arrow" href="${esc(c.gbpUrl)}" target="_blank" rel="noopener">profil w Google</a>.` : ''}</p>`}
    </div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// Strony lokalne i obszar działania
// ------------------------------------------------------------------
export function renderLocal(slug) {
  const l = localBySlug(slug);
  if (!l) return null;
  const p = `/${l.slug}`;
  const svc = l.service ? service(l.service) : null;
  const faq = pairs(l.faq);
  const items = (svc ? priceItems().filter((i) => i.service === svc.slug) : priceItems().filter((i) => i.popular)).slice(0, 6);
  const others = locals().filter((x) => x.slug !== l.slug);
  const crumbs = [['Obszar działania', '/obszar-dzialania'], [l.h1, p]];
  const cityNode = { '@type': 'City', name: l.city || 'Słupsk' };
  return page(p, {
    title: l.seo_title || `${l.h1} | VELIO`,
    description: l.seo_description || l.lead,
    crumbs,
    topic: svc?.name,
    jsonld: [
      { '@type': 'Service', name: l.h1, serviceType: svc?.name || 'Marketing internetowy', url: `${config.siteUrl}${p}`, description: l.lead, provider: { '@id': `${config.siteUrl}/#organization` }, areaServed: cityNode },
      ...(faq.length ? [faqJsonLd(faq)] : []),
    ],
    content: `${pageHero({
      crumbs, kicker: `${l.city || 'Pomorze'} · ${svc ? svc.name : 'Agencja marketingowa'}`, title: l.h1, lead: l.lead,
      actions: `<a class="button button-coral" href="/wycena" data-open-config${svc ? ` data-service="${svc.slug}"` : ''}>${I('wand-sparkles')} Bezpłatna wycena</a><a class="button button-ghost" href="/kontakt" data-open-contact>${I('messages-square')} Napisz do nas</a>`,
    })}
    <section class="section" style="padding-top:30px"><div class="wrap post-layout">
      <article class="prose">${markdown(l.body)}</article>
      <aside class="post-aside">
        <div class="toc"><b>Usługi${l.city ? ` · ${esc(l.city)}` : ''}</b>${services().slice(0, 8).map((sv) => `<a href="/uslugi/${sv.slug}">${esc(sv.name)} <small>${esc(servicePrice(sv))}</small></a>`).join('')}</div>
        ${footerNap()}
      </aside>
    </div></section>
    ${items.length ? `<section class="section" style="padding-top:0"><div class="wrap"><span class="section-kicker">Ceny od</span><div style="margin-top:22px">${priceTable(items, svc)}</div><p class="contact-only"><a class="link-arrow" href="/cennik">Pełny cennik ${I('arrow-up-right')}</a></p></div></section>` : ''}
    ${faq.length ? `<section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Pytania<br><span class="serif">${esc(l.city ? `z ${l.city === 'Słupsk' ? 'Słupska' : l.city === 'Ustka' ? 'Ustki' : l.city === 'Lębork' ? 'Lęborka' : l.city === 'Bytów' ? 'Bytowa' : l.city === 'Miastko' ? 'Miastka' : l.city}` : 'i odpowiedzi')}.</span></h2></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>` : ''}
    ${ctaBand()}
    ${others.length ? `<section class="section" style="padding-top:0;padding-bottom:60px"><div class="wrap"><p class="local-links">${I('map-pin')} Działamy też: ${others.map((o) => `<a href="/${o.slug}">${esc(o.h1)}</a>`).join(' · ')}</p></div></section>` : ''}`,
  });
}

export function renderArea() {
  const list = locals();
  const c = company();
  return page('/obszar-dzialania', {
    title: 'Obszar działania — Słupsk, Ustka, Lębork, Bytów | VELIO',
    description: 'VELIO działa na miejscu w Słupsku, Ustce, Lęborku, Bytowie i Miastku, na całym Pomorzu, a zdalnie w całej Polsce.',
    crumbs: [['Obszar działania', '/obszar-dzialania']],
    content: `${pageHero({ crumbs: [['Obszar działania', '/obszar-dzialania']], kicker: 'Obszar działania', title: 'Na miejscu na Pomorzu.', serif: 'Zdalnie w całej Polsce.', lead: `Jesteśmy ze Słupska. Do firm z okolicy przyjeżdżamy na spotkania i sesje zdjęciowe, a z resztą kraju pracujemy online i przez panel klienta.` })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <div class="other-industries">${list.map((l) => `<a class="other-ind" href="/${l.slug}"><span class="icon-box">${I('map-pin')}</span><span><b>${esc(l.h1)}</b><small>${esc((l.lead || '').slice(0, 90))}…</small></span>${I('arrow-up-right')}</a>`).join('')}</div>
      <ul class="area-list area-inline reveal">${c.areaServed.map((a) => `<li>${I('check')} ${esc(a)}</li>`).join('')}</ul>
    </div></section>
    ${ctaBand()}`,
  });
}

// ------------------------------------------------------------------
// Narzędzia: kalkulator budżetu reklam
// ------------------------------------------------------------------
export function renderAdCalculator() {
  const p = '/narzedzia/kalkulator-budzetu-reklam';
  const crumbs = [['Narzędzia', p], ['Kalkulator budżetu reklam', p]];
  const faq = [
    ['Skąd wziąć koszt kliknięcia (CPC)?', 'Z historii własnych kampanii albo z Planera słów kluczowych Google Ads. W kampaniach lokalnych to zwykle od kilkudziesięciu groszy do kilku złotych, w zależności od branży.'],
    ['Jaki współczynnik konwersji przyjąć?', 'Na start ostrożnie, np. 2–5% dla strony z formularzem. Dobrze zaprojektowany landing page z jasną ofertą zwykle osiąga lepszy wynik niż strona główna.'],
  ];
  return page(p, {
    title: 'Kalkulator budżetu reklam Google i Facebook | VELIO',
    description: 'Policz, ile zapytań i klientów da budżet reklamowy w Google Ads lub Meta Ads, ile kosztuje pozyskanie klienta i czy kampania się zwróci.',
    crumbs: [['Kalkulator budżetu reklam', p]],
    jsonld: [{ '@type': 'WebApplication', name: 'Kalkulator budżetu reklam', url: `${config.siteUrl}${p}`, applicationCategory: 'BusinessApplication', operatingSystem: 'Any', offers: { '@type': 'Offer', price: '0', priceCurrency: 'PLN' }, provider: { '@id': `${config.siteUrl}/#organization` } }, faqJsonLd(faq)],
    content: `${pageHero({ crumbs: [['Kalkulator budżetu reklam', p]], kicker: 'Darmowe narzędzie', title: 'Kalkulator', serif: 'budżetu reklam.', lead: 'Wpisz budżet, koszt kliknięcia i skuteczność strony. Zobaczysz, ile zapytań i klientów możesz się spodziewać i ile kosztuje pozyskanie jednego klienta.' })}
    <section class="section" style="padding-top:30px"><div class="wrap">
      <form class="calc reveal" id="ad-calc" novalidate>
        <div class="calc-fields">
          <div class="field"><label for="c-budget">Budżet miesięczny (zł)</label><input id="c-budget" type="number" min="0" step="50" value="1500" inputmode="decimal"></div>
          <div class="field"><label for="c-cpc">Średni koszt kliknięcia, CPC (zł)</label><input id="c-cpc" type="number" min="0.05" step="0.05" value="2" inputmode="decimal"></div>
          <div class="field"><label for="c-cr">Konwersja strony: % kliknięć, które wysyłają zapytanie</label><input id="c-cr" type="number" min="0" max="100" step="0.5" value="4" inputmode="decimal"></div>
          <div class="field"><label for="c-close">Ile % zapytań zamieniasz w klientów</label><input id="c-close" type="number" min="0" max="100" step="1" value="30" inputmode="decimal"></div>
          <div class="field"><label for="c-value">Średni zysk z jednego klienta (zł)</label><input id="c-value" type="number" min="0" step="50" value="800" inputmode="decimal"></div>
          <div class="field"><label for="c-fee">Obsługa kampanii (zł / mies., opcjonalnie)</label><input id="c-fee" type="number" min="0" step="50" value="690" inputmode="decimal"></div>
        </div>
        <div class="calc-out" aria-live="polite">
          <div class="stat-cell"><strong data-out="clicks">—</strong><span>kliknięć</span></div>
          <div class="stat-cell"><strong data-out="leads">—</strong><span>zapytań</span></div>
          <div class="stat-cell"><strong data-out="clients">—</strong><span>klientów</span></div>
          <div class="stat-cell"><strong data-out="cpl">—</strong><span>koszt zapytania</span></div>
          <div class="stat-cell"><strong data-out="cac">—</strong><span>koszt klienta (z obsługą)</span></div>
          <div class="stat-cell"><strong data-out="roi">—</strong><span>zwrot (zysk − koszty)</span></div>
        </div>
        <p class="calc-note">${I('info')} Wynik to szacunek. Rzeczywisty CPC i konwersja zależą od branży, konkurencji, jakości reklam i strony.</p>
      </form>
    </div></section>
    <section class="section" style="padding-top:0"><div class="wrap faq-grid"><div class="faq-side reveal"><span class="section-kicker">FAQ</span><h2 class="section-title">Jak liczyć<br><span class="serif">dane wejściowe.</span></h2><a class="button button-dark" href="/uslugi/reklamy-platne">${I('megaphone')} Reklamy Google i Meta</a></div><div class="faq-list reveal">${faqHtml(faq)}</div></div></section>
    ${ctaBand('Chcesz policzyć to na swoich danych?', 'Sprawdzimy Twoją branżę i zaproponujemy budżet testowy.')}`,
  });
}

// ------------------------------------------------------------------
// SEO: sitemap, robots, llms.txt
// ------------------------------------------------------------------
const BUILD_DATE = new Date().toISOString().slice(0, 10);
const day = (d) => String(d || '').slice(0, 10) || BUILD_DATE;

/** Wszystkie publiczne adresy (sitemap, panel SEO). */
export function publicPages() {
  const list = [
    { path: '/', name: 'Strona główna', pr: '1.0' },
    { path: '/uslugi', name: 'Usługi', pr: '0.9' },
    ...services().map((s) => ({ path: `/uslugi/${s.slug}`, name: `Usługa: ${s.name}`, pr: '0.8' })),
    { path: '/cennik', name: 'Cennik', pr: '0.9' },
    { path: '/pakiety', name: 'Pakiety', pr: '0.8' },
    { path: '/abonamenty', name: 'Abonamenty', pr: '0.7' },
    { path: '/realizacje', name: 'Realizacje', pr: '0.7' },
    ...cases().map((c) => ({ path: `/realizacje/${c.slug}`, name: `Realizacja: ${c.client || c.title}`, pr: '0.6', lastmod: day(c.updated_at) })),
    { path: '/blog', name: 'Blog', pr: '0.7' },
    ...BLOG_CATEGORIES.filter((c) => posts().some((x) => x.category === c)).map((c) => ({ path: `/blog/kategoria/${catSlug(c)}`, name: `Blog: ${c}`, pr: '0.4' })),
    ...posts().map((x) => ({ path: `/blog/${x.slug}`, name: `Wpis: ${x.title}`, pr: '0.6', lastmod: day(x.updated_at || x.published_at) })),
    { path: '/obszar-dzialania', name: 'Obszar działania', pr: '0.6' },
    ...locals().map((l) => ({ path: `/${l.slug}`, name: `Lokalna: ${l.h1}`, pr: '0.8', lastmod: day(l.updated_at) })),
    { path: '/opinie', name: 'Opinie', pr: '0.5' },
    { path: '/narzedzia/kalkulator-budzetu-reklam', name: 'Kalkulator budżetu reklam', pr: '0.5' },
    { path: '/wycena', name: 'Wycena', pr: '0.7' },
    { path: '/o-nas', name: 'O nas', pr: '0.6' },
    { path: '/kontakt', name: 'Kontakt', pr: '0.7' },
    { path: '/faq', name: 'FAQ', pr: '0.6' },
    { path: '/regulamin', name: 'Regulamin', pr: '0.2' },
    { path: '/polityka-prywatnosci', name: 'Polityka prywatności', pr: '0.2' },
  ];
  return list.filter((x) => !seoFor(x.path)?.noindex);
}

export function sitemapXml() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${publicPages().map((u) => `  <url><loc>${config.siteUrl}${u.path}</loc><lastmod>${u.lastmod || BUILD_DATE}</lastmod><priority>${u.pr}</priority></url>`).join('\n')}
</urlset>
`;
}

export function robotsTxt() {
  return `User-agent: *
Allow: /
Disallow: /panel
Disallow: /admin
Disallow: /api/
Disallow: /*?*utm_
Disallow: /*?temat=
Disallow: /reset-hasla

Sitemap: ${config.siteUrl}/sitemap.xml
`;
}

/** llms.txt — krótki opis firmy dla asystentów AI (https://llmstxt.org). */
export function llmsTxt() {
  const c = company();
  const line = (label, path, note = '') => `- [${label}](${config.siteUrl}${path})${note ? `: ${note}` : ''}`;
  return `# VELIO

> VELIO to agencja marketingowa ze Słupska (województwo pomorskie). Robi strony internetowe, wizytówki Google (Profil Firmy), pozycjonowanie SEO, reklamy Google Ads i Meta Ads, prowadzenie social mediów, automatyzacje AI, branding i materiały drukowane. Działa na miejscu w Słupsku, Ustce, Lęborku, Bytowie i Miastku, a zdalnie w całej Polsce. Nie ma minimalnej kwoty zamówienia: pojedyncze usługi mają ceny „od”, a większość projektów jest wyceniana indywidualnie.

${[c.phone && `Telefon: ${c.phone}`, c.email && `E-mail: ${c.email}`, c.publicAddress && `Adres: ${c.publicAddress}`, c.nip && `NIP: ${c.nip}`].filter(Boolean).join('\n')}

## Oferta
${services().map((s) => line(s.name, `/uslugi/${s.slug}`, `${s.summary} Cena: ${servicePrice(s)}.`)).join('\n')}

## Ceny
${line('Cennik pojedynczych usług', '/cennik', 'ceny „od” netto, bez minimum zamówienia')}
${line('Pakiety', '/pakiety')}
${line('Abonamenty', '/abonamenty')}

## Obszar działania
${locals().map((l) => line(l.h1, `/${l.slug}`)).join('\n')}

## Więcej
${line('Realizacje', '/realizacje')}
${line('Blog', '/blog')}
${line('O nas', '/o-nas')}
${line('Kontakt', '/kontakt')}
${line('FAQ', '/faq')}
`;
}

export const registrationOpen = () => flag('allow_registration');

/** Renderuje publiczną stronę po ścieżce (podgląd meta w panelu SEO). */
export function renderPublicPath(path) {
  const fixed = {
    '/': renderHome, '/uslugi': renderServices, '/pakiety': renderPackages, '/abonamenty': renderPlans, '/o-nas': renderAbout,
    '/kontakt': () => renderContact(''), '/faq': renderFaq, '/wycena': renderQuote, '/regulamin': () => renderLegal('regulamin'),
    '/polityka-prywatnosci': () => renderLegal('prywatnosc'), '/cennik': renderPricing, '/blog': () => renderBlog(), '/realizacje': renderCases,
    '/opinie': renderReviews, '/obszar-dzialania': renderArea, '/narzedzia/kalkulator-budzetu-reklam': renderAdCalculator,
  };
  if (fixed[path]) return fixed[path]();
  let m;
  if ((m = path.match(/^\/uslugi\/([a-z0-9-]+)$/))) return renderService(m[1]);
  if ((m = path.match(/^\/blog\/kategoria\/([a-z0-9-]+)$/))) return renderBlog(m[1]);
  if ((m = path.match(/^\/blog\/([a-z0-9-]+)$/))) return renderPost(m[1]);
  if ((m = path.match(/^\/realizacje\/([a-z0-9-]+)$/))) return renderCase(m[1]);
  if ((m = path.match(/^\/([a-z0-9-]+)$/))) return renderLocal(m[1]);
  return null;
}
