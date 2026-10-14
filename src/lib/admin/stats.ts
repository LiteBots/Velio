import "server-only";
import { connectDb } from "@/lib/db/mongoose";
import { LeadModel, UserModel } from "@/lib/models";
import { openStatuses } from "./labels";

/**
 * Statystyki panelu. Wszystko liczone z prawdziwych zgłoszeń w bazie.
 * „Sprzedaż” = wartości netto wpisane przez administratora przy wygranych zgłoszeniach —
 * to nie jest zaksięgowany przychód (płatności podłączymy w kolejnym etapie).
 */

const DAY = 86400000;
const TZ = "Europe/Warsaw";

export type Bucket = { key: string; count: number };

export type DashboardStats = {
  dbOk: boolean;
  leads: { total: number; today: number; d7: number; d30: number; prev30: number };
  byStatus: Bucket[];
  byForm: Bucket[];
  byNeed: Bucket[];
  byBudget: Bucket[];
  daily: { date: string; count: number }[];
  sales: {
    wonCount: number;
    lostCount: number;
    wonValue: number;
    wonValue30: number;
    pipelineValue: number;
    pipelineCount: number;
    avgDeal: number;
    winRate: number | null;
    monthly: { month: string; value: number; count: number }[];
  };
  upcoming: { id: string; number: string; name: string; company?: string; nextContactAt: string; status: string }[];
  recent: { id: string; number: string; name: string; company?: string; createdAt: string; status: string; formType: string }[];
  users: number;
};

const empty: DashboardStats = {
  dbOk: false,
  leads: { total: 0, today: 0, d7: 0, d30: 0, prev30: 0 },
  byStatus: [],
  byForm: [],
  byNeed: [],
  byBudget: [],
  daily: [],
  sales: { wonCount: 0, lostCount: 0, wonValue: 0, wonValue30: 0, pipelineValue: 0, pipelineCount: 0, avgDeal: 0, winRate: null, monthly: [] },
  upcoming: [],
  recent: [],
  users: 0,
};

/** Początek dzisiejszego dnia w strefie Europe/Warsaw. */
function startOfTodayWarsaw() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(now);
  const utcMidnight = new Date(`${parts}T00:00:00Z`).getTime();
  const offset = new Date(now.toLocaleString("en-US", { timeZone: TZ })).getTime() - new Date(now.toLocaleString("en-US", { timeZone: "UTC" })).getTime();
  return new Date(utcMidnight - offset);
}

const toBuckets = (rows: { _id: unknown; count: number }[]): Bucket[] =>
  rows.map((r) => ({ key: r._id == null || r._id === "" ? "brak" : String(r._id), count: r.count })).sort((a, b) => b.count - a.count);

export async function getDashboardStats(): Promise<DashboardStats> {
  try {
    if (!(await connectDb())) return empty;
  } catch {
    return empty;
  }

  const now = Date.now();
  const today = startOfTodayWarsaw();
  const d7 = new Date(now - 7 * DAY);
  const d30 = new Date(now - 30 * DAY);
  const d60 = new Date(now - 60 * DAY);
  const y1 = new Date(now - 365 * DAY);

  const [
    total,
    cToday,
    c7,
    c30,
    cPrev30,
    byStatus,
    byForm,
    byNeed,
    byBudget,
    daily,
    wonAgg,
    won30Agg,
    pipeAgg,
    lostCount,
    monthly,
    upcoming,
    recent,
    users,
  ] = await Promise.all([
    LeadModel.countDocuments({}),
    LeadModel.countDocuments({ createdAt: { $gte: today } }),
    LeadModel.countDocuments({ createdAt: { $gte: d7 } }),
    LeadModel.countDocuments({ createdAt: { $gte: d30 } }),
    LeadModel.countDocuments({ createdAt: { $gte: d60, $lt: d30 } }),
    LeadModel.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $group: { _id: "$formType", count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $unwind: "$needs" }, { $group: { _id: "$needs", count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $group: { _id: "$budget", count: { $sum: 1 } } }]),
    LeadModel.aggregate([
      { $match: { createdAt: { $gte: d30 } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt", timezone: TZ } }, count: { $sum: 1 } } },
    ]),
    LeadModel.aggregate([{ $match: { status: "wygrany" } }, { $group: { _id: null, value: { $sum: { $ifNull: ["$dealValue", 0] } }, count: { $sum: 1 } } }]),
    LeadModel.aggregate([{ $match: { status: "wygrany", wonAt: { $gte: d30 } } }, { $group: { _id: null, value: { $sum: { $ifNull: ["$dealValue", 0] } } } }]),
    LeadModel.aggregate([
      { $match: { status: { $in: openStatuses } } },
      { $group: { _id: null, value: { $sum: { $ifNull: ["$dealValue", 0] } }, count: { $sum: 1 } } },
    ]),
    LeadModel.countDocuments({ status: "przegrany" }),
    LeadModel.aggregate([
      { $match: { status: "wygrany", wonAt: { $gte: y1 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$wonAt", timezone: TZ } },
          value: { $sum: { $ifNull: ["$dealValue", 0] } },
          count: { $sum: 1 },
        },
      },
    ]),
    LeadModel.find({ status: { $in: openStatuses }, nextContactAt: { $ne: null, $lte: new Date(now + 7 * DAY) } })
      .sort({ nextContactAt: 1 })
      .limit(8)
      .lean(),
    LeadModel.find({}).sort({ createdAt: -1 }).limit(7).lean(),
    UserModel.countDocuments({}),
  ]);

  // pełna oś 30 dni (także dni bez zgłoszeń)
  const dailyMap = new Map((daily as { _id: string; count: number }[]).map((d) => [d._id, d.count]));
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" });
  const dailyFull = Array.from({ length: 30 }, (_, i) => {
    const key = fmt.format(new Date(now - (29 - i) * DAY));
    return { date: key, count: dailyMap.get(key) ?? 0 };
  });

  // pełna oś 12 miesięcy
  const monthMap = new Map((monthly as { _id: string; value: number; count: number }[]).map((m) => [m._id, m]));
  const monthFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit" });
  const nowD = new Date();
  const monthlyFull = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(Date.UTC(nowD.getUTCFullYear(), nowD.getUTCMonth() - (11 - i), 15));
    const key = monthFmt.format(d).slice(0, 7);
    const m = monthMap.get(key);
    return { month: key, value: m?.value ?? 0, count: m?.count ?? 0 };
  });

  const wonCount = wonAgg[0]?.count ?? 0;
  const wonValue = wonAgg[0]?.value ?? 0;

  type L = Record<string, unknown> & { _id: { toString(): string }; contact?: { name?: string }; company?: { name?: string } };
  return {
    dbOk: true,
    leads: { total, today: cToday, d7: c7, d30: c30, prev30: cPrev30 },
    byStatus: toBuckets(byStatus),
    byForm: toBuckets(byForm),
    byNeed: toBuckets(byNeed),
    byBudget: toBuckets(byBudget),
    daily: dailyFull,
    sales: {
      wonCount,
      lostCount,
      wonValue,
      wonValue30: won30Agg[0]?.value ?? 0,
      pipelineValue: pipeAgg[0]?.value ?? 0,
      pipelineCount: pipeAgg[0]?.count ?? 0,
      avgDeal: wonCount ? Math.round(wonValue / wonCount) : 0,
      winRate: wonCount + lostCount > 0 ? wonCount / (wonCount + lostCount) : null,
      monthly: monthlyFull,
    },
    upcoming: (upcoming as L[]).map((l) => ({
      id: l._id.toString(),
      number: String(l.number),
      name: l.contact?.name ?? "",
      company: l.company?.name,
      nextContactAt: new Date(l.nextContactAt as string).toISOString(),
      status: String(l.status),
    })),
    recent: (recent as L[]).map((l) => ({
      id: l._id.toString(),
      number: String(l.number),
      name: l.contact?.name ?? "",
      company: l.company?.name,
      createdAt: new Date(l.createdAt as string).toISOString(),
      status: String(l.status),
      formType: String(l.formType),
    })),
    users,
  };
}
