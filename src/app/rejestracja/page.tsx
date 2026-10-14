import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/layout/auth-placeholder";

export const metadata: Metadata = {
  title: "Utwórz konto",
  robots: { index: false, follow: true },
  alternates: { canonical: "/rejestracja" },
};

export default function RegisterPage() {
  return <AuthPlaceholder title="Konto klienta" crumb="Utwórz konto" href="/rejestracja" />;
}
