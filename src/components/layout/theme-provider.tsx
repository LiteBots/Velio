"use client";

import { ThemeProvider as NextThemes } from "next-themes";
import type { ReactNode } from "react";

/** Zapamiętuje wybór w localStorage (klucz „velio-theme”), przy pierwszej wizycie używa ustawień systemu. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemes
      attribute="data-theme"
      defaultTheme="system"
      enableSystem
      storageKey="velio-theme"
      disableTransitionOnChange
    >
      {children}
    </NextThemes>
  );
}
