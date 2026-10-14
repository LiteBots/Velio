import type { Metadata } from "next";
import { AuthPlaceholder } from "@/components/layout/auth-placeholder";

export const metadata: Metadata = {
  title: "Resetowanie hasła",
  robots: { index: false, follow: false },
};

export default function ResetPasswordPage() {
  return <AuthPlaceholder title="Resetowanie hasła" crumb="Resetowanie hasła" href="/reset-hasla" />;
}
