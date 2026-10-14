import "server-only";
import { cache } from "react";
import seed from "@/data/catalog.seed.json";
import { connectDb } from "@/lib/db/mongoose";
import { FaqModel, PackageModel, PlanModel, PostModel, ServiceModel } from "@/lib/models";
import type { Catalog, DemoProject, Faq, Package, Plan, Service } from "./types";

/**
 * Źródło prawdy dla oferty to MongoDB. Gdy baza nie jest jeszcze skonfigurowana
 * lub kolekcje są puste (świeży deploy przed `npm run seed`), strona korzysta
 * z danych startowych z src/data/catalog.seed.json — tych samych, które seed zapisuje w bazie.
 */

const seedCatalog: Catalog = {
  services: seed.services as unknown as Service[],
  packages: seed.packages as unknown as Package[],
  plans: seed.plans as unknown as Plan[],
  faqs: seed.faqs as unknown as Faq[],
  source: "seed",
};

const strip = <T,>(docs: unknown[]): T[] =>
  docs.map((d) => {
    const { _id, createdAt, updatedAt, ...rest } = d as Record<string, unknown>;
    void _id; void createdAt; void updatedAt;
    return rest as T;
  });

/**
 * Podczas `next build` nie łączymy się z bazą: na Railway sieć prywatna (mongodb.railway.internal)
 * nie jest dostępna w fazie budowania. Strony są potem odświeżane z bazy co `revalidate` sekund.
 */
const isBuildPhase = () => process.env.NEXT_PHASE === "phase-production-build";

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (isBuildPhase()) return seedCatalog;
  try {
    const db = await connectDb();
    if (!db) return seedCatalog;

    const [services, packages, plans, faqs] = await Promise.all([
      ServiceModel.find({ published: true }).sort({ order: 1 }).lean(),
      PackageModel.find({ published: true }).sort({ order: 1 }).lean(),
      PlanModel.find({ published: true }).sort({ order: 1 }).lean(),
      FaqModel.find({ published: true }).sort({ order: 1 }).lean(),
    ]);

    if (services.length === 0) {
      console.warn("[catalog] Kolekcja usług jest pusta — uruchom `npm run seed`. Używam danych startowych.");
      return seedCatalog;
    }

    return {
      services: strip<Service>(services),
      packages: strip<Package>(packages),
      plans: strip<Plan>(plans),
      faqs: strip<Faq>(faqs),
      source: "database",
    };
  } catch (err) {
    console.error("[catalog] Nie udało się odczytać katalogu z bazy, używam danych startowych:", (err as Error).message);
    return seedCatalog;
  }
});

export async function getServices() {
  return (await getCatalog()).services;
}

export async function getService(slug: string) {
  return (await getCatalog()).services.find((s) => s.slug === slug) ?? null;
}

export async function getPackages() {
  return (await getCatalog()).packages;
}

export async function getPlans() {
  return (await getCatalog()).plans;
}

export async function getFaqs() {
  return (await getCatalog()).faqs;
}

/** Projekty demonstracyjne — zawsze oznaczone na stronie jako przykłady, nie realizacje. */
export function getDemoProjects(): DemoProject[] {
  return seed.demoProjects as unknown as DemoProject[];
}

/** Lista slugów do generowania statycznych podstron usług. */
export function getSeedServiceSlugs() {
  return seed.services.map((s) => s.slug);
}

export type BlogPost = {
  slug: string;
  title: string;
  excerpt?: string;
  body?: string;
  category?: string;
  publishedAt?: string;
  seo?: { title?: string; description?: string };
};

export const blogCategories = [
  { slug: "strony-i-konwersja", name: "Strony i konwersja" },
  { slug: "seo", name: "SEO" },
  { slug: "reklamy", name: "Reklamy" },
  { slug: "automatyzacje", name: "AI i automatyzacje" },
  { slug: "marka", name: "Marka" },
];

export async function getPosts(): Promise<BlogPost[]> {
  if (isBuildPhase()) return [];
  try {
    const db = await connectDb();
    if (!db) return [];
    const posts = await PostModel.find({ published: true }).sort({ publishedAt: -1 }).limit(100).lean();
    return posts.map((p: Record<string, unknown>) => ({
      slug: String(p.slug),
      title: String(p.title),
      excerpt: p.excerpt as string | undefined,
      category: p.category as string | undefined,
      publishedAt: p.publishedAt ? new Date(p.publishedAt as string).toISOString() : undefined,
    }));
  } catch (err) {
    console.error("[blog] Błąd odczytu wpisów:", (err as Error).message);
    return [];
  }
}

export async function getPost(slug: string): Promise<BlogPost | null> {
  if (isBuildPhase()) return null;
  try {
    const db = await connectDb();
    if (!db) return null;
    const p = (await PostModel.findOne({ slug, published: true }).lean()) as Record<string, unknown> | null;
    if (!p) return null;
    return {
      slug: String(p.slug),
      title: String(p.title),
      excerpt: p.excerpt as string | undefined,
      body: p.body as string | undefined,
      category: p.category as string | undefined,
      publishedAt: p.publishedAt ? new Date(p.publishedAt as string).toISOString() : undefined,
      seo: p.seo as BlogPost["seo"],
    };
  } catch {
    return null;
  }
}
