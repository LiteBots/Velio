import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { ThemeProvider } from "@/components/layout/theme-provider";
import { siteConfig } from "@/lib/config";
import "./globals.css";

const font = Schibsted_Grotesk({
  subsets: ["latin", "latin-ext"],
  variable: "--font-velio",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "VELIO — marketing, technologia i automatyzacje dla firm",
    template: "%s | VELIO",
  },
  description: siteConfig.description,
  applicationName: "VELIO",
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    siteName: "VELIO",
    url: siteConfig.url,
  },
  twitter: { card: "summary_large_image" },
  alternates: { canonical: "/" },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: [{ color: "#0c0d10" }],
};

/** Wspólny szkielet: strona publiczna ma swój layout w (site), panel admina w admin/. */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pl" suppressHydrationWarning className={font.variable}>
      <head>
        {/* klasa .js włącza animacje wejścia — bez JavaScriptu treść jest od razu widoczna */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
