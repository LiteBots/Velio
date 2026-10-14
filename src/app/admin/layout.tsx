import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "Panel administratora", template: "%s | Panel VELIO" },
  robots: { index: false, follow: false, nocache: true },
};

// panel zawsze renderowany na żądanie, z aktualnymi danymi
export const dynamic = "force-dynamic";

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
