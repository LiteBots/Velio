import {
  ChartLine,
  Globe,
  LayoutTemplate,
  Mail,
  Megaphone,
  PenTool,
  Printer,
  Search,
  Shirt,
  Target,
  Users,
  Workflow,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/catalog/types";

const map: Record<IconName, LucideIcon> = {
  layout: LayoutTemplate,
  search: Search,
  megaphone: Megaphone,
  workflow: Workflow,
  pen: PenTool,
  printer: Printer,
  shirt: Shirt,
  target: Target,
  mail: Mail,
  users: Users,
  globe: Globe,
  chart: ChartLine,
};

export function ServiceIcon({ name, size = 22, className }: { name: IconName | string; size?: number; className?: string }) {
  const Icon = map[name as IconName] ?? LayoutTemplate;
  return <Icon size={size} strokeWidth={1.6} className={className} aria-hidden="true" />;
}
