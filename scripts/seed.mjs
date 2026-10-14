/**
 * Zapisuje katalog oferty (usługi, pakiety, abonamenty, FAQ) w MongoDB.
 *
 *   npm run seed         — dodaje brakujące elementy, NIE nadpisuje tego, co zmieniono w bazie
 *   npm run seed:reset   — nadpisuje elementy katalogu danymi startowymi (leady i wpisy bloga zostają)
 *
 * Na Railway: uruchom raz w zakładce usługi → „Run command” albo lokalnie z MONGODB_URI z Railway.
 */
import { readFile } from "node:fs/promises";
import mongoose from "mongoose";

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("Brak MONGODB_URI. Ustaw zmienną środowiskową (np. w pliku .env).");
  process.exit(1);
}

const reset = process.argv.includes("--reset");
const data = JSON.parse(await readFile(new URL("../src/data/catalog.seed.json", import.meta.url), "utf8"));

await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || "velio", serverSelectionTimeoutMS: 8000 });
const db = mongoose.connection.db;

const collections = {
  services: data.services,
  packages: data.packages,
  plans: data.plans,
  faqs: data.faqs,
};

for (const [name, items] of Object.entries(collections)) {
  const col = db.collection(name);
  await col.createIndex({ slug: 1 }, { unique: true });
  let inserted = 0;
  let updated = 0;
  for (const item of items) {
    const now = new Date();
    if (reset) {
      const r = await col.updateOne(
        { slug: item.slug },
        { $set: { ...item, updatedAt: now }, $setOnInsert: { createdAt: now } },
        { upsert: true },
      );
      r.upsertedCount ? inserted++ : updated++;
    } else {
      const r = await col.updateOne(
        { slug: item.slug },
        { $setOnInsert: { ...item, createdAt: now, updatedAt: now } },
        { upsert: true },
      );
      if (r.upsertedCount) inserted++;
    }
  }
  console.log(`${name}: dodano ${inserted}${reset ? `, nadpisano ${updated}` : ""}`);
}

// indeksy pomocnicze dla zapytań
await db.collection("leads").createIndex({ number: 1 }, { unique: true });
await db.collection("leads").createIndex({ createdAt: -1 });
await db.collection("posts").createIndex({ slug: 1 }, { unique: true });

await mongoose.disconnect();
console.log("Gotowe.");
