import { NextResponse } from "next/server";
import { connectDb, isDbConfigured } from "@/lib/db/mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Healthcheck dla Railway. Aplikacja jest „zdrowa” także bez bazy — status bazy raportujemy osobno. */
export async function GET() {
  let database: "connected" | "not_configured" | "error" = "not_configured";
  if (isDbConfigured()) {
    try {
      const db = await connectDb();
      await db?.connection.db?.admin().ping();
      database = "connected";
    } catch {
      database = "error";
    }
  }
  return NextResponse.json({ status: "ok", database, time: new Date().toISOString() });
}
