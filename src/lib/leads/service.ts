import "server-only";
import { createHash } from "node:crypto";
import { connectDb } from "@/lib/db/mongoose";
import { CounterModel, LeadModel } from "@/lib/models";
import type { LeadData } from "./schema";
import { budgetOptions, needOptions } from "./schema";

/** Numer zgłoszenia w formacie VEL-2026-00042 (atomowy licznik w MongoDB, osobny na każdy rok). */
async function nextLeadNumber() {
  const year = new Date().getFullYear();
  const counter = await CounterModel.findOneAndUpdate(
    { _id: `lead-${year}` },
    { $inc: { seq: 1 } },
    { new: true, upsert: true },
  ).lean<{ seq: number }>();
  return `VEL-${year}-${String(counter?.seq ?? 0).padStart(5, "0")}`;
}

export function hashIp(ip: string) {
  // nie przechowujemy surowego IP — tylko skrót do wykrywania nadużyć
  return createHash("sha256").update(`${ip}:${process.env.MONGODB_DB ?? "velio"}`).digest("hex").slice(0, 32);
}

export class LeadStorageUnavailable extends Error {}

export async function saveLead(data: LeadData, ip: string) {
  const db = await connectDb();
  if (!db) throw new LeadStorageUnavailable("Baza danych nie jest skonfigurowana (MONGODB_URI).");

  const number = await nextLeadNumber();
  const details = data.formType === "druk" ? data.print : data.formType === "automatyzacje" ? data.automation : undefined;

  const doc = await LeadModel.create({
    number,
    formType: data.formType,
    needs: data.needs,
    service: data.service,
    packageSlug: data.packageSlug,
    company: data.company,
    goals: data.goals,
    timeline: data.timeline,
    budget: data.budget,
    details,
    contact: data.contact,
    consents: data.consents,
    source: data.source,
    ipHash: hashIp(ip),
  });

  // powiadomienie nie może zablokować zapisu zgłoszenia
  notifyAdmin(number, data)
    .then(async (sent) => {
      if (sent) await LeadModel.updateOne({ _id: doc._id }, { $set: { notified: true } });
    })
    .catch((err) => console.error("[leads] Powiadomienie nie zostało wysłane:", err));

  return { number };
}

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

async function notifyAdmin(number: string, d: LeadData): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.LEADS_NOTIFY_EMAIL;
  const from = process.env.LEADS_FROM_EMAIL;
  if (!key || !to || !from) {
    console.info(`[leads] Nowe zgłoszenie ${number} zapisane. Powiadomienia e-mail nie są skonfigurowane (RESEND_API_KEY, LEADS_NOTIFY_EMAIL, LEADS_FROM_EMAIL).`);
    return false;
  }

  const needs = d.needs.map((n) => needOptions.find((o) => o.value === n)?.label ?? n).join(", ") || "—";
  const budget = budgetOptions.find((o) => o.value === d.budget)?.label ?? "—";
  const rows: [string, string | undefined][] = [
    ["Formularz", d.formType],
    ["Potrzeby", needs],
    ["Usługa", d.service],
    ["Pakiet", d.packageSlug],
    ["Firma", d.company?.name],
    ["Branża", d.company?.industry],
    ["Strona", d.company?.website],
    ["Budżet", budget],
    ["Cele", d.goals],
    ["Kontakt", `${d.contact.name} <${d.contact.email}>${d.contact.phone ? `, ${d.contact.phone}` : ""}`],
  ];
  const extra = d.formType === "druk" ? d.print : d.formType === "automatyzacje" ? d.automation : undefined;
  if (extra) for (const [k, v] of Object.entries(extra)) rows.push([k, v as string | undefined]);

  const html = `<h2>Nowe zgłoszenie ${esc(number)}</h2><table cellpadding="6">${rows
    .filter(([, v]) => v)
    .map(([k, v]) => `<tr><td><strong>${esc(k)}</strong></td><td>${esc(String(v)).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: [to],
      reply_to: d.contact.email,
      subject: `Nowe zgłoszenie ${number} — ${d.company?.name ?? d.contact.name}`,
      html,
    }),
  });
  if (!res.ok) {
    console.error("[leads] Resend zwrócił błąd:", res.status, await res.text().catch(() => ""));
    return false;
  }
  return true;
}
