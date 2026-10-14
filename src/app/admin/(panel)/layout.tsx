import { AdminShell } from "@/components/admin/shell";
import { requireAdmin } from "@/lib/admin/auth";
import { connectDb } from "@/lib/db/mongoose";
import { LeadModel } from "@/lib/models";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  let newLeads = 0;
  try {
    if (await connectDb()) newLeads = await LeadModel.countDocuments({ status: "nowy" });
  } catch {
    /* brak bazy — panel nadal działa, strony pokażą komunikat */
  }
  return <AdminShell newLeads={newLeads}>{children}</AdminShell>;
}
