import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/layout/auth-placeholder";

export const metadata: Metadata = {
  title: "Logowanie do panelu klienta",
  robots: { index: false, follow: true },
  alternates: { canonical: "/logowanie" },
};

export default function LoginPage() {
  return <AuthPlaceholder title="Logowanie do panelu klienta" crumb="Logowanie" href="/logowanie" />;
}
