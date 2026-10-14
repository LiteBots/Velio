import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { LeadModel } from "@/lib/models";
import { leadStatuses } from "./labels";

export type LeadFilters = { q?: string; status?: string; form?: string; from?: string; to?: string; page?: number };
export const PAGE_SIZE = 25;

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Buduje zapytanie MongoDB z filtrów listy (bezpiecznie — tylko znane pola i wartości). */
export function buildLeadQuery(f: LeadFilters) {
  const q: Record<string, unknown> = {};
  if (f.status && leadStatuses.some((s) => s.value === f.status)) q.status = f.status;
  if (f.form && /^[a-z]{3,20}$/.test(f.form)) q.formType = f.form;
  const range: Record<string, Date> = {};
  if (f.from && !Number.isNaN(Date.parse(f.from))) range.$gte = new Date(`${f.from}T00:00:00`);
  if (f.to && !Number.isNaN(Date.parse(f.to))) range.$lte = new Date(`${f.to}T23:59:59`);
  if (Object.keys(range).length) q.createdAt = range;
  const text = f.q?.trim().slice(0, 80);
  if (text) {
    const re = new RegExp(escapeRe(text), "i");
    q.$or = [{ number: re }, { "contact.name": re }, { "contact.email": re }, { "contact.phone": re }, { "company.name": re }, { goals: re }];
  }
  return q;
}

export type LeadRow = {
  id: string;
  number: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  formType: string;
  status: string;
  dealValue: number | null;
  createdAt: string;
  nextContactAt: string | null;
};

type Raw = Record<string, unknown> & {
  _id: { toString(): string };
  contact?: { name?: string; email?: string; phone?: string };
  company?: { name?: string };
};

export const toRow = (l: Raw): LeadRow => ({
  id: l._id.toString(),
  number: String(l.number),
  name: l.contact?.name ?? "",
  email: l.contact?.email ?? "",
  phone: l.contact?.phone,
  company: l.company?.name,
  formType: String(l.formType),
  status: String(l.status),
  dealValue: typeof l.dealValue === "number" ? l.dealValue : null,
  createdAt: new Date(l.createdAt as string).toISOString(),
  nextContactAt: l.nextContactAt ? new Date(l.nextContactAt as string).toISOString() : null,
});

export async function listLeads(f: LeadFilters) {
  if (!(await connectDb())) return null;
  const query = buildLeadQuery(f);
  const page = Math.max(1, f.page ?? 1);
  const [rows, total] = await Promise.all([
    LeadModel.find(query).sort({ createdAt: -1 }).skip((page - 1) * PAGE_SIZE).limit(PAGE_SIZE).lean(),
    LeadModel.countDocuments(query),
  ]);
  return { rows: (rows as Raw[]).map(toRow), total, page, pages: Math.max(1, Math.ceil(total / PAGE_SIZE)) };
}
