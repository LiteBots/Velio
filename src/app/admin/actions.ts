"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import seed from "@/data/catalog.seed.json";
import { attemptLogin, logAdmin, logout, requireAdmin } from "@/lib/admin/auth";
import { leadStatuses, statusLabel } from "@/lib/admin/labels";
import { connectDb } from "@/lib/db/mongoose";
import { FaqModel, LeadModel, PackageModel, PlanModel, PostModel, ServiceModel, UserModel } from "@/lib/models";

/**
 * Akcje panelu administratora. Każda zaczyna się od requireAdmin() — uprawnienia są
 * sprawdzane na serwerze, a nie przez ukrywanie przycisków. Next.js dodatkowo weryfikuje
 * nagłówek Origin akcji (ochrona przed CSRF).
 */

export type ActionState = { ok?: boolean; error?: string; message?: string };

async function db() {
  const c = await connectDb();
  if (!c) throw new Error("Baza danych nie jest skonfigurowana (MONGODB_URI).");
  return c;
}

const isId = (v: string) => /^[a-f0-9]{24}$/i.test(v);
const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const lines = (v: string) =>
  v
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

/** Po zmianach w ofercie odśwież stronę publiczną od razu, bez czekania na revalidate. */
function refreshSite() {
  revalidatePath("/", "layout");
}

// ─────────────────────────── logowanie ───────────────────────────

export async function loginAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  const pin = str(form, "pin");
  const res = await attemptLogin(pin);
  if (!res.ok) return { error: res.error };
  redirect("/admin");
}

export async function logoutAction() {
  await logAdmin("wylogowanie");
  await logout();
  redirect("/admin/logowanie");
}

// ─────────────────────────── zgłoszenia ───────────────────────────

const statusValues = leadStatuses.map((s) => s.value) as [string, ...string[]];

export async function setLeadStatus(form: FormData) {
  await requireAdmin();
  await db();
  const id = str(form, "id");
  const status = str(form, "status");
  if (!isId(id) || !statusValues.includes(status)) return;
  const lead = await LeadModel.findById(id).lean<{ status: string; number: string; wonAt?: Date } | null>();
  if (!lead || lead.status === status) return;
  const update: Record<string, unknown> = { status };
  if (status === "wygrany" && !lead.wonAt) update.wonAt = new Date();
  if (status !== "wygrany") update.wonAt = null;
  await LeadModel.updateOne(
    { _id: id },
    { $set: update, $push: { history: { at: new Date(), field: "status", from: lead.status, to: status } } },
  );
  await logAdmin("status", lead.number, `${statusLabel(lead.status)} → ${statusLabel(status)}`);
  revalidatePath("/admin", "layout");
}

const leadEditSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
  dealValue: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : Number(v.replace(/\s/g, "").replace(",", "."))))
    .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v < 100_000_000), "Podaj poprawną kwotę."),
  nextContactAt: z
    .string()
    .trim()
    .transform((v) => (v ? new Date(v) : null))
    .refine((v) => v === null || !Number.isNaN(v.getTime()), "Nieprawidłowa data."),
  assignee: z.string().trim().max(80),
});

export async function updateLead(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const parsed = leadEditSchema.safeParse({
    id: str(form, "id"),
    dealValue: str(form, "dealValue"),
    nextContactAt: str(form, "nextContactAt"),
    assignee: str(form, "assignee"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Sprawdź pola." };
  await db();
  const { id, ...data } = parsed.data;
  const lead = await LeadModel.findByIdAndUpdate(id, { $set: data }, { new: true }).lean<{ number: string } | null>();
  if (!lead) return { error: "Nie znaleziono zgłoszenia." };
  await logAdmin("lead_edycja", lead.number, `wartość: ${data.dealValue ?? "—"}, kontakt: ${data.nextContactAt?.toISOString().slice(0, 10) ?? "—"}`);
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Zapisano." };
}

export async function addLeadNote(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const text = str(form, "text").slice(0, 2000);
  if (!isId(id)) return { error: "Nieprawidłowe zgłoszenie." };
  if (!text) return { error: "Wpisz treść notatki." };
  await db();
  const lead = await LeadModel.findByIdAndUpdate(id, { $push: { notes: { text, at: new Date() } } }).lean<{ number: string } | null>();
  if (!lead) return { error: "Nie znaleziono zgłoszenia." };
  await logAdmin("lead_notatka", lead.number);
  revalidatePath(`/admin/zgloszenia/${id}`);
  return { ok: true, message: "Dodano notatkę." };
}

export async function deleteLeadNote(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const noteId = str(form, "noteId");
  if (!isId(id) || !isId(noteId)) return;
  await db();
  await LeadModel.updateOne({ _id: id }, { $pull: { notes: { _id: noteId } } });
  revalidatePath(`/admin/zgloszenia/${id}`);
}

export async function deleteLead(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  if (!isId(id) || str(form, "confirm") !== "USUŃ") return;
  await db();
  const lead = await LeadModel.findByIdAndDelete(id).lean<{ number: string } | null>();
  if (lead) await logAdmin("lead_usuniecie", lead.number);
  revalidatePath("/admin", "layout");
  redirect("/admin/zgloszenia");
}

// ─────────────────────────── oferta ───────────────────────────

const money = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : Number(v.replace(/\s/g, "").replace(",", "."))))
  .refine((v) => v === null || (Number.isFinite(v) && v >= 0 && v < 10_000_000), "Podaj poprawną cenę.");

export async function updatePackage(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = str(form, "slug");
  const price = money.safeParse(str(form, "priceFrom"));
  if (!price.success) return { error: price.error.issues[0].message };
  const name = str(form, "name");
  if (!name) return { error: "Nazwa jest wymagana." };
  await db();
  const res = await PackageModel.updateOne(
    { slug },
    {
      $set: {
        name,
        audience: str(form, "audience"),
        description: str(form, "description"),
        priceFrom: price.data,
        priceUnit: str(form, "priceUnit"),
        duration: str(form, "duration"),
        includes: lines(str(form, "includes")),
        limits: lines(str(form, "limits")),
        extensions: lines(str(form, "extensions")),
        separateCosts: str(form, "separateCosts"),
        featured: form.get("featured") === "on",
        published: form.get("published") === "on",
        order: Number(str(form, "order")) || 0,
      },
    },
  );
  if (!res.matchedCount) return { error: "Pakiet nie istnieje w bazie. Wgraj ofertę startową w Ustawieniach." };
  await logAdmin("oferta", `pakiet:${slug}`, `cena od: ${price.data ?? "indywidualna"}`);
  refreshSite();
  return { ok: true, message: "Zapisano. Strona publiczna została odświeżona." };
}

export async function updateService(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = str(form, "slug");
  const price = money.safeParse(str(form, "amount"));
  if (!price.success) return { error: price.error.issues[0].message };
  const name = str(form, "name");
  if (!name) return { error: "Nazwa jest wymagana." };
  const note = str(form, "pricingNote");
  const pricing =
    str(form, "pricingKind") === "from" && price.data !== null
      ? { kind: "from", amount: price.data, unit: str(form, "unit") || "netto", ...(note ? { note } : {}) }
      : { kind: "quote", ...(note ? { note } : {}) };
  await db();
  const res = await ServiceModel.updateOne(
    { slug },
    {
      $set: {
        name,
        summary: str(form, "summary"),
        intro: str(form, "intro"),
        scope: lines(str(form, "scope")),
        pricing,
        pricingNotice: str(form, "pricingNotice"),
        "seo.title": str(form, "seoTitle"),
        "seo.description": str(form, "seoDescription"),
        published: form.get("published") === "on",
        order: Number(str(form, "order")) || 0,
      },
    },
  );
  if (!res.matchedCount) return { error: "Usługa nie istnieje w bazie. Wgraj ofertę startową w Ustawieniach." };
  await logAdmin("oferta", `usluga:${slug}`, pricing.kind === "from" ? `od ${price.data}` : "wycena indywidualna");
  refreshSite();
  return { ok: true, message: "Zapisano. Strona publiczna została odświeżona." };
}

export async function updatePlan(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const slug = str(form, "slug");
  const price = money.safeParse(str(form, "priceFrom"));
  if (!price.success) return { error: price.error.issues[0].message };
  const billing = form.getAll("billing").map(String).filter((b) => ["one_time", "subscription", "invoice", "quote", "manual_approval"].includes(b));
  await db();
  const res = await PlanModel.updateOne(
    { slug },
    {
      $set: {
        name: str(form, "name"),
        summary: str(form, "summary"),
        features: lines(str(form, "features")),
        billing,
        priceFrom: price.data,
        priceUnit: str(form, "priceUnit"),
        published: form.get("published") === "on",
        order: Number(str(form, "order")) || 0,
      },
    },
  );
  if (!res.matchedCount) return { error: "Abonament nie istnieje w bazie. Wgraj ofertę startową w Ustawieniach." };
  await logAdmin("oferta", `abonament:${slug}`, `cena od: ${price.data ?? "indywidualna"}`);
  refreshSite();
  return { ok: true, message: "Zapisano. Strona publiczna została odświeżona." };
}

// ─────────────────────────── FAQ ───────────────────────────

const slugify = (v: string) =>
  v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ł/g, "l")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

export async function saveFaq(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const q = str(form, "q");
  const a = str(form, "a");
  if (!q || !a) return { error: "Pytanie i odpowiedź są wymagane." };
  await db();
  const data = { q, a, category: str(form, "category") || "Współpraca", order: Number(str(form, "order")) || 0, published: form.get("published") === "on" };
  if (isId(id)) await FaqModel.updateOne({ _id: id }, { $set: data });
  else await FaqModel.create({ ...data, slug: `${slugify(q)}-${Date.now().toString(36)}` });
  await logAdmin("faq", q.slice(0, 60), isId(id) ? "edycja" : "nowe");
  refreshSite();
  return { ok: true, message: isId(id) ? "Zapisano pytanie." : "Dodano pytanie." };
}

export async function deleteFaq(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  if (!isId(id)) return;
  await db();
  await FaqModel.deleteOne({ _id: id });
  await logAdmin("faq", id, "usunięcie");
  refreshSite();
}

// ─────────────────────────── blog ───────────────────────────

export async function savePost(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const id = str(form, "id");
  const title = str(form, "title");
  if (!title) return { error: "Tytuł jest wymagany." };
  const slug = slugify(str(form, "slug") || title);
  if (!slug) return { error: "Nieprawidłowy adres wpisu." };
  const published = form.get("published") === "on";
  await db();
  const clash = await PostModel.findOne({ slug, ...(isId(id) ? { _id: { $ne: id } } : {}) }).lean();
  if (clash) return { error: "Wpis o takim adresie już istnieje." };
  const existing = isId(id) ? await PostModel.findById(id).lean<{ publishedAt?: Date } | null>() : null;
  const data = {
    title,
    slug,
    excerpt: str(form, "excerpt"),
    body: String(form.get("body") ?? "").slice(0, 60000),
    category: str(form, "category"),
    published,
    publishedAt: published ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null),
    seo: { title: str(form, "seoTitle"), description: str(form, "seoDescription") },
  };
  let newId = id;
  if (isId(id)) await PostModel.updateOne({ _id: id }, { $set: data });
  else newId = String((await PostModel.create(data))._id);
  await logAdmin("blog", slug, isId(id) ? "edycja" : "nowy wpis");
  refreshSite();
  if (!isId(id)) redirect(`/admin/blog/${newId}`);
  return { ok: true, message: published ? "Zapisano i opublikowano." : "Zapisano jako szkic." };
}

export async function deletePost(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  if (!isId(id)) return;
  await db();
  const p = await PostModel.findByIdAndDelete(id).lean<{ slug: string } | null>();
  await logAdmin("blog", p?.slug, "usunięcie");
  refreshSite();
  redirect("/admin/blog");
}

// ─────────────────────────── użytkownicy ───────────────────────────

export async function setUserStatus(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const status = str(form, "status");
  if (!isId(id) || !["active", "blocked"].includes(status)) return;
  await db();
  const u = await UserModel.findByIdAndUpdate(id, { $set: { status } }).lean<{ email: string } | null>();
  await logAdmin("uzytkownik", u?.email, status === "blocked" ? "zablokowanie" : "odblokowanie");
  revalidatePath("/admin/uzytkownicy");
}

export async function setUserRole(form: FormData) {
  await requireAdmin();
  const id = str(form, "id");
  const role = str(form, "role");
  // rola właściciela jest przypisana do kodu PIN — z panelu nadajemy tylko role zespołu i klienta
  if (!isId(id) || !["admin", "manager", "specialist", "client"].includes(role)) return;
  await db();
  const u = await UserModel.findByIdAndUpdate(id, { $set: { role } }).lean<{ email: string } | null>();
  await logAdmin("uzytkownik", u?.email, `rola: ${role}`);
  revalidatePath("/admin/uzytkownicy");
}

// ─────────────────────────── ustawienia ───────────────────────────

/** Wgrywa ofertę startową — dodaje tylko brakujące elementy, nic nie nadpisuje. */
export async function seedCatalog(): Promise<void> {
  await requireAdmin();
  const conn = await db();
  const d = conn.connection.db!;
  const now = new Date();
  let added = 0;
  for (const [name, items] of Object.entries({
    services: seed.services,
    packages: seed.packages,
    plans: seed.plans,
    faqs: seed.faqs,
  }) as [string, { slug: string }[]][]) {
    const col = d.collection(name);
    for (const item of items) {
      const r = await col.updateOne({ slug: item.slug }, { $setOnInsert: { ...item, createdAt: now, updatedAt: now } }, { upsert: true });
      if (r.upsertedCount) added++;
    }
  }
  await logAdmin("seed", undefined, `dodano ${added} elementów`);
  refreshSite();
  revalidatePath("/admin", "layout");
}
