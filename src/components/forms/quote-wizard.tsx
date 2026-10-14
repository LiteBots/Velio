"use client";

import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  budgetOptions,
  leadSchema,
  needOptions,
  sizeOptions,
  timelineOptions,
  type LeadInput,
} from "@/lib/leads/schema";
import { Choice, Consents, FormAlert, Honeypot, SelectField, SubmittedState, TextArea, TextField } from "./fields";
import { submitLead } from "./lead-client";
import { issuesToMap } from "./validation";

export type WizardVariant = "wycena" | "druk" | "automatyzacje" | "indywidualny";

type State = {
  needs: string[];
  company: { name: string; industry: string; website: string; size: string };
  goals: string;
  timeline: string;
  budget: string;
  print: { product: string; format: string; quantity: string; material: string; finish: string; deadline: string; filesUrl: string };
  automation: { process: string; tools: string; volume: string };
  contact: { name: string; email: string; phone: string; preferred: "" | "email" | "telefon" };
  privacy: boolean;
  marketing: boolean;
};

const steps = ["Potrzeby", "Firma", "Cele", "Budżet", "Kontakt", "Podsumowanie"] as const;
const DRAFT_KEY = "velio-wycena-szkic";

const emptyState = (variant: WizardVariant, preNeeds: string[]): State => ({
  needs: preNeeds.length ? preNeeds : variant === "druk" ? ["druk"] : variant === "automatyzacje" ? ["ai"] : [],
  company: { name: "", industry: "", website: "", size: "" },
  goals: "",
  timeline: "",
  budget: "",
  print: { product: "", format: "", quantity: "", material: "", finish: "", deadline: "", filesUrl: "" },
  automation: { process: "", tools: "", volume: "" },
  contact: { name: "", email: "", phone: "", preferred: "" },
  privacy: false,
  marketing: false,
});

/** Pola, które sprawdzamy na danym kroku (ścieżki z błędów zod). */
const stepFields: Record<number, string[]> = {
  0: ["needs"],
  1: ["company.name", "company.industry", "company.website", "company.size"],
  2: ["goals", "timeline", "print", "automation"],
  3: ["budget"],
  4: ["contact", "consents"],
};

export function QuoteWizard({
  variant,
  service,
  serviceName,
  packageSlug,
  packageName,
  preNeeds = [],
}: {
  variant: WizardVariant;
  service?: string;
  serviceName?: string;
  packageSlug?: string;
  packageName?: string;
  preNeeds?: string[];
}) {
  const startedAt = useRef(Date.now());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [step, setStep] = useState(0);
  const [s, setS] = useState<State>(() => emptyState(variant, preNeeds));
  const [hp, setHp] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<{ number: string | null } | null>(null);
  const [restored, setRestored] = useState(false);

  // szkic w sessionStorage — tylko na tym urządzeniu i tylko do zamknięcia karty
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${DRAFT_KEY}:${variant}`);
      if (raw) {
        const draft = JSON.parse(raw) as { s: State; step: number };
        setS({ ...draft.s, needs: preNeeds.length ? Array.from(new Set([...draft.s.needs, ...preNeeds])) : draft.s.needs });
        setStep(Math.min(draft.step, 4));
        setRestored(true);
      }
    } catch {
      /* brak dostępu do storage — formularz działa bez szkicu */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (done) return;
    try {
      sessionStorage.setItem(`${DRAFT_KEY}:${variant}`, JSON.stringify({ s, step }));
    } catch {
      /* ignoruj */
    }
  }, [s, step, variant, done]);

  const formType = variant;

  function buildPayload(): LeadInput {
    return {
      formType,
      needs: s.needs,
      service,
      packageSlug,
      company: { ...s.company, size: s.company.size || undefined },
      goals: s.goals,
      timeline: s.timeline || undefined,
      budget: s.budget || undefined,
      print: variant === "druk" ? s.print : undefined,
      automation: variant === "automatyzacje" ? s.automation : undefined,
      contact: { ...s.contact, preferred: s.contact.preferred || undefined },
      consents: { privacy: s.privacy as true, marketing: s.marketing },
      website_url: hp,
      startedAt: startedAt.current,
    } as LeadInput;
  }

  function validate(upTo: number) {
    const res = leadSchema.safeParse(buildPayload());
    const map = res.success ? {} : issuesToMap(res.error.issues);
    if (s.needs.length === 0) map.needs = "Wybierz co najmniej jeden obszar.";
    const relevant = Object.keys(stepFields)
      .map(Number)
      .filter((k) => k <= upTo)
      .flatMap((k) => stepFields[k]);
    const filtered: Record<string, string> = {};
    for (const [k, v] of Object.entries(map)) {
      if (relevant.some((p) => k === p || k.startsWith(`${p}.`))) filtered[k] = v;
    }
    return filtered;
  }

  function go(next: number) {
    setFormError(null);
    if (next > step) {
      const errs = validate(step);
      setErrors(errs);
      if (Object.keys(errs).length) {
        setFormError("Popraw zaznaczone pola, żeby przejść dalej.");
        return;
      }
    }
    setStep(next);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  async function submit() {
    const errs = validate(4);
    setErrors(errs);
    if (Object.keys(errs).length) {
      setFormError("Niektóre pola wymagają poprawy.");
      const firstStep = Number(
        Object.keys(stepFields).find((k) => stepFields[Number(k)].some((p) => Object.keys(errs).some((e) => e === p || e.startsWith(`${p}.`)))) ?? 4,
      );
      setStep(firstStep);
      return;
    }
    setPending(true);
    setFormError(null);
    const res = await submitLead(buildPayload());
    setPending(false);
    if (res.ok) {
      setDone({ number: res.number });
      try {
        sessionStorage.removeItem(`${DRAFT_KEY}:${variant}`);
      } catch {
        /* ignoruj */
      }
    } else {
      setFormError(res.error);
    }
  }

  const toggleNeed = (v: string) =>
    setS((p) => ({ ...p, needs: p.needs.includes(v) ? p.needs.filter((n) => n !== v) : [...p.needs, v] }));
  const setCompany = (k: keyof State["company"]) => (e: { target: { value: string } }) =>
    setS((p) => ({ ...p, company: { ...p.company, [k]: e.target.value } }));
  const setPrint = (k: keyof State["print"]) => (e: { target: { value: string } }) =>
    setS((p) => ({ ...p, print: { ...p.print, [k]: e.target.value } }));
  const setAuto = (k: keyof State["automation"]) => (e: { target: { value: string } }) =>
    setS((p) => ({ ...p, automation: { ...p.automation, [k]: e.target.value } }));
  const setContact = (k: "name" | "email" | "phone") => (e: { target: { value: string } }) =>
    setS((p) => ({ ...p, contact: { ...p.contact, [k]: e.target.value } }));

  if (done) {
    return (
      <SubmittedState
        number={done.number}
        onReset={() => {
          setS(emptyState(variant, []));
          setStep(0);
          setDone(null);
          startedAt.current = Date.now();
        }}
      />
    );
  }

  const progress = ((step + 1) / steps.length) * 100;
  const label = (arr: readonly { value: string; label: string }[], v: string) => arr.find((o) => o.value === v)?.label;

  return (
    <div className="relative">
      <Honeypot value={hp} onChange={setHp} />

      {/* postęp */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold">Krok {step + 1} z {steps.length}</span>
          <span className="t-faint">{steps[step]}</span>
        </div>
        <div
          className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={step + 1}
          aria-label="Postęp formularza"
        >
          <div className="h-full rounded-full bg-accent transition-[width] duration-500" style={{ width: `${progress}%` }} />
        </div>
        <ol className="mt-3 hidden gap-1 text-xs text-ink-3 md:flex">
          {steps.map((name, i) => (
            <li key={name} className={`flex-1 ${i === step ? "font-semibold text-ink" : ""}`}>{name}</li>
          ))}
        </ol>
      </div>

      {restored && step > 0 && (
        <div className="mb-6">
          <FormAlert tone="success">Przywróciliśmy szkic, który wypełniałeś w tej karcie przeglądarki.</FormAlert>
        </div>
      )}

      {(packageName || serviceName) && (
        <p className="mb-6 text-sm">
          <span className="tag tag-accent">{packageName ? `Pakiet: ${packageName}` : `Usługa: ${serviceName}`}</span>
        </p>
      )}

      <div key={step} className="enter grid gap-6" style={{ animationDuration: "0.4s" }}>
        <h2 ref={headingRef} tabIndex={-1} className="t-h3 outline-none">
          {step === 0 && "Czego potrzebujesz?"}
          {step === 1 && "Opowiedz o firmie"}
          {step === 2 && "Jaki jest cel projektu?"}
          {step === 3 && "Jaki budżet bierzesz pod uwagę?"}
          {step === 4 && "Jak się z Tobą skontaktować?"}
          {step === 5 && "Sprawdź i wyślij"}
        </h2>

        {step === 0 && (
          <fieldset>
            <legend className="t-muted mb-4 text-[0.95rem]">Zaznacz wszystkie obszary, które Cię interesują.</legend>
            <div className="grid gap-2.5 sm:grid-cols-2">
              {needOptions.map((o) => (
                <Choice key={o.value} type="checkbox" name="needs" label={o.label} checked={s.needs.includes(o.value)} onChange={() => toggleNeed(o.value)} />
              ))}
            </div>
            {errors.needs && <p className="error-text mt-3">{errors.needs}</p>}
          </fieldset>
        )}

        {step === 1 && (
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Nazwa firmy" optional autoComplete="organization" value={s.company.name} onChange={setCompany("name")} error={errors["company.name"]} />
            <TextField label="Branża" optional value={s.company.industry} onChange={setCompany("industry")} error={errors["company.industry"]} placeholder="Np. usługi budowlane" />
            <TextField label="Adres strony" optional inputMode="url" value={s.company.website} onChange={setCompany("website")} error={errors["company.website"]} placeholder="firma.pl" />
            <SelectField label="Wielkość firmy" optional options={sizeOptions} value={s.company.size} onChange={setCompany("size")} />
            <p className="hint sm:col-span-2">Możesz pominąć ten krok — dopytamy w rozmowie.</p>
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-6">
            <TextArea
              label="Co ma się zmienić po projekcie?"
              optional
              rows={5}
              value={s.goals}
              onChange={(e) => setS((p) => ({ ...p, goals: e.target.value }))}
              error={errors.goals}
              placeholder="Np. więcej zapytań z okolicy, krótszy czas odpowiedzi na leady, nowa marka przed targami."
            />

            {variant === "druk" && (
              <fieldset className="grid gap-5 rounded-[var(--radius)] border border-line p-5 sm:grid-cols-2">
                <legend className="px-1 text-sm font-semibold">Parametry druku</legend>
                <TextField label="Produkt" optional value={s.print.product} onChange={setPrint("product")} placeholder="Np. ulotka, katalog, etykieta" />
                <TextField label="Format" optional value={s.print.format} onChange={setPrint("format")} placeholder="Np. A5, 85×55 mm" />
                <TextField label="Nakład" optional inputMode="numeric" value={s.print.quantity} onChange={setPrint("quantity")} placeholder="Np. 500 szt." />
                <TextField label="Materiał" optional value={s.print.material} onChange={setPrint("material")} placeholder="Np. kreda 350 g" />
                <TextField label="Wykończenie" optional value={s.print.finish} onChange={setPrint("finish")} placeholder="Np. folia matowa, lakier UV" />
                <TextField label="Termin" optional type="date" value={s.print.deadline} onChange={setPrint("deadline")} />
                <div className="sm:col-span-2">
                  <TextField
                    label="Link do plików"
                    optional
                    inputMode="url"
                    value={s.print.filesUrl}
                    onChange={setPrint("filesUrl")}
                    error={errors["print.filesUrl"]}
                    placeholder="https://"
                    hint="Wklej link do dysku w chmurze. Przesyłanie plików bezpośrednio uruchomimy razem z panelem klienta."
                  />
                </div>
              </fieldset>
            )}

            {variant === "automatyzacje" && (
              <fieldset className="grid gap-5 rounded-[var(--radius)] border border-line p-5">
                <legend className="px-1 text-sm font-semibold">Proces do automatyzacji</legend>
                <TextArea label="Opisz proces krok po kroku" optional rows={4} value={s.automation.process} onChange={setAuto("process")} placeholder="Np. zapytanie przychodzi mailem, ktoś przepisuje je do arkusza, potem…" />
                <div className="grid gap-5 sm:grid-cols-2">
                  <TextField label="Narzędzia, z których korzystacie" optional value={s.automation.tools} onChange={setAuto("tools")} placeholder="Np. Gmail, arkusz, CRM" />
                  <TextField label="Skala" optional value={s.automation.volume} onChange={setAuto("volume")} placeholder="Np. ok. 40 zapytań tygodniowo" />
                </div>
              </fieldset>
            )}

            <fieldset>
              <legend className="label mb-3">Kiedy chcesz zacząć? <span className="font-normal text-ink-3">(opcjonalnie)</span></legend>
              <div className="grid gap-2.5 sm:grid-cols-3">
                {timelineOptions.map((o) => (
                  <Choice key={o.value} type="radio" name="timeline" label={o.label} checked={s.timeline === o.value} onChange={() => setS((p) => ({ ...p, timeline: o.value }))} />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {step === 3 && (
          <fieldset>
            <legend className="t-muted mb-4 text-[0.95rem]">
              Orientacyjnie — pomoże nam dobrać zakres. Budżet reklamowy (płacony platformom) podaj osobno w opisie celu.
            </legend>
            <div className="grid gap-2.5">
              {budgetOptions.map((o) => (
                <Choice key={o.value} type="radio" name="budget" label={o.label} checked={s.budget === o.value} onChange={() => setS((p) => ({ ...p, budget: o.value }))} />
              ))}
            </div>
          </fieldset>
        )}

        {step === 4 && (
          <div className="grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Imię i nazwisko" autoComplete="name" value={s.contact.name} onChange={setContact("name")} error={errors["contact.name"]} required />
              <TextField label="E-mail" type="email" autoComplete="email" value={s.contact.email} onChange={setContact("email")} error={errors["contact.email"]} required />
              <TextField label="Telefon" optional type="tel" autoComplete="tel" value={s.contact.phone} onChange={setContact("phone")} error={errors["contact.phone"]} />
            </div>
            <fieldset>
              <legend className="label mb-3">Preferowany kontakt <span className="font-normal text-ink-3">(opcjonalnie)</span></legend>
              <div className="grid max-w-md gap-2.5 sm:grid-cols-2">
                <Choice type="radio" name="preferred" label="E-mail" checked={s.contact.preferred === "email"} onChange={() => setS((p) => ({ ...p, contact: { ...p.contact, preferred: "email" } }))} />
                <Choice type="radio" name="preferred" label="Telefon" checked={s.contact.preferred === "telefon"} onChange={() => setS((p) => ({ ...p, contact: { ...p.contact, preferred: "telefon" } }))} />
              </div>
            </fieldset>
            <Consents
              privacy={s.privacy}
              marketing={s.marketing}
              onPrivacy={(v) => setS((p) => ({ ...p, privacy: v }))}
              onMarketing={(v) => setS((p) => ({ ...p, marketing: v }))}
              error={errors["consents.privacy"]}
            />
          </div>
        )}

        {step === 5 && (
          <dl className="divide-y divide-line rounded-[var(--radius)] border border-line">
            {[
              ["Obszary", s.needs.map((n) => label(needOptions, n)).join(", "), 0],
              ...(packageName ? [["Pakiet", packageName, 0] as const] : []),
              ...(serviceName ? [["Usługa", serviceName, 0] as const] : []),
              ["Firma", [s.company.name, s.company.industry, s.company.website, label(sizeOptions, s.company.size)].filter(Boolean).join(", "), 1],
              ["Cel", s.goals, 2],
              ...(variant === "druk"
                ? [["Druk", Object.values(s.print).filter(Boolean).join(", "), 2] as const]
                : []),
              ...(variant === "automatyzacje"
                ? [["Proces", [s.automation.process, s.automation.tools, s.automation.volume].filter(Boolean).join(" / "), 2] as const]
                : []),
              ["Start", label(timelineOptions, s.timeline), 2],
              ["Budżet", label(budgetOptions, s.budget), 3],
              ["Kontakt", [s.contact.name, s.contact.email, s.contact.phone].filter(Boolean).join(", "), 4],
            ].map(([k, v, target]) => (
              <div key={String(k)} className="grid gap-1 p-4 sm:grid-cols-[150px_1fr_auto] sm:items-start sm:gap-4">
                <dt className="t-small t-faint font-semibold">{k}</dt>
                <dd className="whitespace-pre-line break-words text-[0.95rem]">{v || <span className="t-faint">—</span>}</dd>
                <button type="button" className="t-small link-u justify-self-start" onClick={() => setStep(Number(target))}>
                  Zmień
                </button>
              </div>
            ))}
          </dl>
        )}

        {formError && <FormAlert tone="error">{formError}</FormAlert>}

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
          {step > 0 ? (
            <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)}>
              <ArrowLeft size={18} aria-hidden="true" /> Wróć
            </button>
          ) : (
            <span />
          )}
          {step < steps.length - 1 ? (
            <button type="button" className="btn btn-ink btn-lg" onClick={() => go(step + 1)}>
              {step === 1 && !s.company.name && !s.company.industry && !s.company.website ? "Pomiń" : "Dalej"}
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-lg" onClick={submit} disabled={pending}>
              {pending && <LoaderCircle size={18} className="animate-spin" aria-hidden="true" />}
              {pending ? "Wysyłanie…" : "Wyślij zgłoszenie"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
