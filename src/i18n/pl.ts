/**
 * Teksty interfejsu (nawigacja, przyciski, komunikaty). Kolejne języki: dodaj plik en.ts
 * o tym samym kształcie i wybieraj słownik na podstawie segmentu [locale] w routingu.
 */
export const pl = {
  nav: {
    services: "Usługi",
    packages: "Pakiety",
    plans: "Stała współpraca",
    work: "Realizacje",
    about: "O nas",
    blog: "Blog",
    contact: "Kontakt",
    faq: "FAQ",
    login: "Zaloguj się",
    register: "Utwórz konto",
    cta: "Wyceń projekt",
    menuOpen: "Otwórz menu",
    menuClose: "Zamknij menu",
    allServices: "Wszystkie usługi",
  },
  theme: {
    label: "Motyw",
    light: "Jasny",
    dark: "Ciemny",
    system: "Systemowy",
    toggle: "Zmień motyw",
  },
  common: {
    home: "Strona główna",
    netPrice: "netto",
    from: "od",
    quote: "Wycena indywidualna",
    askQuote: "Zapytaj o wycenę",
    choosePackage: "Wybieram pakiet",
    readMore: "Szczegóły usługi",
    back: "Wróć",
    next: "Dalej",
    send: "Wyślij zapytanie",
    sending: "Wysyłanie…",
  },
} as const;

export type Dictionary = typeof pl;
export const t = pl;
