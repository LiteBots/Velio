import "server-only";
import mongoose, { Schema, type Model } from "mongoose";

/**
 * Modele MongoDB. Katalog oferty (usługi, pakiety, abonamenty, FAQ) jest przechowywany w bazie,
 * żeby ceny i opisy można było zmieniać bez wdrażania kodu (panel admina — etap 3).
 */

const opts = { timestamps: true, versionKey: false } as const;

const ServiceSchema = new Schema(
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

const PackageSchema = new Schema(
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

const PlanSchema = new Schema(
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

const FaqSchema = new Schema(
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

const PostSchema = new Schema(
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

const LeadSchema = new Schema(
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

const CounterSchema = new Schema({ _id: String, seq: { type: Number, default: 0 } }, { versionKey: false });

function model<T>(name: string, schema: Schema): Model<T> {
  return (mongoose.models[name] as Model<T>) || mongoose.model<T>(name, schema);
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export const ServiceModel = model<any>("Service", ServiceSchema);
export const PackageModel = model<any>("Package", PackageSchema);
export const PlanModel = model<any>("Plan", PlanSchema);
export const FaqModel = model<any>("Faq", FaqSchema);
export const PostModel = model<any>("Post", PostSchema);
export const LeadModel = model<any>("Lead", LeadSchema);
export const CounterModel = model<any>("Counter", CounterSchema);
