"use client";

import { ShortInquiryForm } from "./short-inquiry-form";

export function ServiceInquiryForm({ serviceSlug, serviceName }: { serviceSlug: string; serviceName: string }) {
  return (
    <ShortInquiryForm
      formType="usluga"
      service={serviceSlug}
      messageLabel="Czego dotyczy zapytanie?"
      messagePlaceholder={`Np. obecna sytuacja, cel, termin — w kontekście usługi „${serviceName}”.`}
    />
  );
}
