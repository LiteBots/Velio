import "server-only";
import mongoose from "mongoose";

/**
 * Jedno połączenie na proces (w trybie dev przechowywane w globalThis, żeby HMR nie mnożył połączeń).
 * Zwraca null, gdy MONGODB_URI nie jest ustawione — wywołujący decyduje, co wtedy zrobić.
 */
type Cache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const g = globalThis as unknown as { __velioMongo?: Cache };
const cache: Cache = g.__velioMongo ?? { conn: null, promise: null };
g.__velioMongo = cache;

export function isDbConfigured() {
  return Boolean(process.env.MONGODB_URI);
}

export async function connectDb(): Promise<typeof mongoose | null> {
  const uri = process.env.MONGODB_URI;
  if (!uri) return null;
  if (cache.conn) return cache.conn;
  if (!cache.promise) {
    cache.promise = mongoose
      .connect(uri, {
        dbName: process.env.MONGODB_DB || "velio",
        serverSelectionTimeoutMS: 4000,
        bufferCommands: false,
      })
      .catch((err) => {
        cache.promise = null;
        throw err;
      });
  }
  cache.conn = await cache.promise;
  return cache.conn;
}
