"use client";

import { LoaderCircle } from "lucide-react";
import { useRef, useState, type FormEvent } from "react";
import { leadSchema, type LeadInput } from "@/lib/leads/schema";
import { Consents, FormAlert, Honeypot, SubmittedState, TextArea, TextField } from "./fields";
import { submitLead } from "./lead-client";
import { issuesToMap } from "./validation";

/** Krótki formularz zapytania — podstrony usług i strona kontaktu. */
export function ShortInquiryForm({
  formType,
  service,
  packageSlug,
  messageLabel = "Opisz krótko, czego potrzebujesz",
  messagePlaceholder,
}: {
  formType: "usluga" | "kontakt";
  service?: string;
  packageSlug?: string;
  messageLabel?: string;
  messagePlaceholder?: string;
}) {
  const startedAt = useRef(Date.now());
  const [values, setValues] = useState({ name: "", email: "", phone: "", company: "", message: "" });
  const [privacy, setPrivacy] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ number: string | null } | null>(null);

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFormError(null);
    const payload: LeadInput = {
      formType,
      needs: [],
      service,
      packageSlug,
      company: { name: values.company },
      goals: values.message,
      contact: { name: values.name, email: values.email, phone: values.phone },
      consents: { privacy: privacy as true, marketing },
      website_url: hp,
      startedAt: startedAt.current,
    };
    const check = leadSchema.safeParse(payload);
    if (!check.success) {
      setErrors(issuesToMap(check.error.issues));
      setFormError("Sprawdź zaznaczone pola.");
      return;
    }
    setErrors({});
    setPending(true);
    const res = await submitLead(payload);
    setPending(false);
    if (res.ok) setDone({ number: res.number });
    else setFormError(res.error);
  }

  if (done) return <SubmittedState number={done.number} />;

  return (
    <form onSubmit={onSubmit} noValidate className="relative grid gap-5">
      <Honeypot value={hp} onChange={setHp} />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField label="Imię i nazwisko" autoComplete="name" value={values.name} onChange={set("name")} error={errors["contact.name"]} required />
        <TextField label="Firma" optional autoComplete="organization" value={values.company} onChange={set("company")} error={errors["company.name"]} />
        <TextField label="E-mail" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors["contact.email"]} required />
        <TextField label="Telefon" optional type="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} error={errors["contact.phone"]} />
      </div>
      <TextArea label={messageLabel} optional placeholder={messagePlaceholder} value={values.message} onChange={set("message")} error={errors.goals} rows={5} />
      <Consents privacy={privacy} marketing={marketing} onPrivacy={setPrivacy} onMarketing={setMarketing} error={errors["consents.privacy"]} />
      {formError && <FormAlert tone="error">{formError}</FormAlert>}
      <div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={pending}>
          {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
          {pending ? "Wysyłanie…" : "Wyślij zapytanie"}
        </button>
      </div>
    </form>
  );
}
