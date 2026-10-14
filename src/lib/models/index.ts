import "server-only";
import mongoose, { Schema, type Model } from "mongoose";

/**
 * Modele MongoDB. Katalog oferty (usługi, pakiety, abonamenty, FAQ) jest przechowywany w bazie,
 * żeby ceny i opisy można było zmieniać bez wdrażania kodu (panel admina — etap 3).
 */

/*
 * WAŻNE dla wydajności `next build`: Mongoose próbuje wywnioskować typ dokumentu z każdej
 * definicji schematu (InferSchemaType). Przy zagnieżdżonych obiektach i polach Mixed potrafi to
 * zająć > 4 GB pamięci podczas sprawdzania typów. Dlatego definicje przechodzą przez helper
 * `schema()`, który przekazuje je jako zwykły obiekt — bez inferencji. Typy dokumentów
 * opisujemy ręcznie w src/lib/catalog/types.ts.
 */
type AnyDoc = Record<string, unknown>;
/* eslint-disable @typescript-eslint/no-explicit-any */
function schema(definition: Record<string, unknown>, options: Record<string, unknown> = opts): Schema {
  return new Schema<AnyDoc>(definition as any, options as any) as unknown as Schema;
}

const opts: Record<string, unknown> = { timestamps: true, versionKey: false };

const ServiceSchema = schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    order: { type: Number, default: 0 },
    group: String,
    icon: String,
    name: { type: String, required: true },
    summary: String,
    intro: String,
    scope: [String],
    benefits: [{ _id: false, title: String, text: String }],
    process: [{ _id: false, title: String, text: String }],
    pricing: { type: Schema.Types.Mixed },
    pricingNotice: String,
    faq: [{ _id: false, q: String, a: String }],
    formVariant: { type: String, default: "ogolny" },
    seo: { _id: false, title: String, description: String },
    published: { type: Boolean, default: true },
  },
  opts,
);

const PackageSchema = schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    order: { type: Number, default: 0 },
    name: { type: String, required: true },
    audience: String,
    description: String,
    priceFrom: { type: Number, default: null },
    priceUnit: String,
    duration: String,
    includes: [String],
    limits: [String],
    extensions: [String],
    addons: [{ _id: false, name: String, note: String }],
    separateCosts: String,
    featured: { type: Boolean, default: false },
    published: { type: Boolean, default: true },
  },
  opts,
);

const PlanSchema = schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    order: { type: Number, default: 0 },
    name: { type: String, required: true },
    summary: String,
    features: [String],
    billing: [String],
    priceFrom: { type: Number, default: null },
    priceUnit: String,
    relatedService: String,
    published: { type: Boolean, default: true },
  },
  opts,
);

const FaqSchema = schema(
  {
    slug: { type: String, required: true, unique: true },
    order: { type: Number, default: 0 },
    category: String,
    q: String,
    a: String,
    published: { type: Boolean, default: true },
  },
  opts,
);

const PostSchema = schema(
  {
    slug: { type: String, required: true, unique: true, index: true },
    title: { type: String, required: true },
    excerpt: String,
    body: String,
    category: String,
    publishedAt: Date,
    published: { type: Boolean, default: false },
    seo: { _id: false, title: String, description: String },
  },
  opts,
);

const LeadSchema = schema(
  {
    number: { type: String, required: true, unique: true },
    formType: { type: String, required: true },
    needs: [String],
    service: String,
    packageSlug: String,
    company: {
      _id: false,
      name: String,
      industry: String,
      website: String,
      size: String,
    },
    goals: String,
    timeline: String,
    budget: String,
    details: { type: Schema.Types.Mixed },
    contact: {
      _id: false,
      name: { type: String, required: true },
      email: { type: String, required: true },
      phone: String,
      preferred: String,
    },
    consents: {
      _id: false,
      privacy: { type: Boolean, required: true },
      marketing: { type: Boolean, default: false },
    },
    // etapy lejka z panelu CRM (etap 3)
    status: {
      type: String,
      enum: ["nowy", "pierwszy_kontakt", "kwalifikacja", "spotkanie", "oferta", "negocjacje", "wygrany", "przegrany"],
      default: "nowy",
      index: true,
    },
    source: { _id: false, page: String, referrer: String, utm: Schema.Types.Mixed },
    notified: { type: Boolean, default: false },
    ipHash: String,
  },
  opts,
);

const CounterSchema = schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });

function model(name: string, s: Schema): Model<any> {
  return (mongoose.models[name] as Model<any>) || (mongoose.model(name, s as any) as unknown as Model<any>);
}

export const ServiceModel = model("Service", ServiceSchema);
export const PackageModel = model("Package", PackageSchema);
export const PlanModel = model("Plan", PlanSchema);
export const FaqModel = model("Faq", FaqSchema);
export const PostModel = model("Post", PostSchema);
export const LeadModel = model("Lead", LeadSchema);
export const CounterModel = model("Counter", CounterSchema);
