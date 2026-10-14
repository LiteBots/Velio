import { NextResponse } from "next/server";
import { isAdmin, logAdmin } from "@/lib/admin/auth";
import { formTypeLabels, statusLabel } from "@/lib/admin/labels";
import { buildLeadQuery } from "@/lib/admin/leads";
import { connectDb } from "@/lib/db/mongoose";
import { budgetOptions, needOptions } from "@/lib/leads/schema";
import { LeadModel } from "@/lib/models";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Eksport zgłoszeń do CSV (z tymi samymi filtrami co lista). Dostęp tylko po zalogowaniu. */
export async function GET(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Brak dostępu" }, { status: 401 });
  if (!(await connectDb())) return NextResponse.json({ error: "Baza danych nie jest skonfigurowana" }, { status: 503 });

  const sp = new URL(req.url).searchParams;
  const query = buildLeadQuery({
    q: sp.get("q") ?? undefined,
    status: sp.get("status") ?? undefined,
    form: sp.get("form") ?? undefined,
    from: sp.get("od") ?? undefined,
    to: sp.get("do") ?? undefined,
  });
  const leads = (await LeadModel.find(query).sort({ createdAt: -1 }).limit(20000).lean()) as Record<string, any>[]; // eslint-disable-line @typescript-eslint/no-explicit-any

  // ochrona przed wstrzyknięciem formuł w arkuszu (=, +, -, @ na początku komórki)
  const cell = (v: unknown) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const header = [
    "Numer", "Data", "Status", "Formularz", "Imię i nazwisko", "E-mail", "Telefon", "Firma", "Branża", "Strona",
    "Potrzeby", "Usługa", "Pakiet", "Budżet", "Cel", "Wartość netto", "Data wygrania", "Następny kontakt", "Zgoda marketingowa",
  ];
  const rows = leads.map((l) => [
    l.number,
    new Date(l.createdAt).toISOString(),
    statusLabel(l.status),
    formTypeLabels[l.formType] ?? l.formType,
    l.contact?.name,
    l.contact?.email,
    l.contact?.phone,
    l.company?.name,
    l.company?.industry,
    l.company?.website,
    (l.needs ?? []).map((n: string) => needOptions.find((o) => o.value === n)?.label ?? n).join(", "),
    l.service,
    l.packageSlug,
    budgetOptions.find((o) => o.value === l.budget)?.label ?? l.budget,
    l.goals,
    l.dealValue,
    l.wonAt ? new Date(l.wonAt).toISOString().slice(0, 10) : "",
    l.nextContactAt ? new Date(l.nextContactAt).toISOString().slice(0, 10) : "",
    l.consents?.marketing ? "tak" : "nie",
  ]);
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(";")).join("\r\n");
  await logAdmin("eksport", undefined, `${leads.length} zgłoszeń`);

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="velio-zgloszenia-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
