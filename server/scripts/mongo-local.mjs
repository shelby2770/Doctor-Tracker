/*
 * Starts a PERSISTENT local MongoDB without Docker, using the binary that
 * `mongodb-memory-server` downloads & caches. Data is stored on disk in
 * `server/.mongo-data` and survives restarts, so the seed script and the API
 * share the same database (unlike an ephemeral in-memory instance).
 *
 * Usage:  npm run db:local   (keep this running in its own terminal)
 * Then:   npm run seed       and   npm run dev
 *
 * This is the "no Docker" alternative to `docker compose up -d`. Both expose
 * MongoDB on mongodb://localhost:27017, so nothing else needs to change.
 */
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { mkdirSync } from "node:fs";
import { MongoMemoryServer } from "mongodb-memory-server";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dbPath = resolve(__dirname, "..", ".mongo-data");
mkdirSync(dbPath, { recursive: true });

const PORT = Number(process.env.LOCAL_DB_PORT ?? 27017);

console.log("Starting local MongoDB (first run downloads a binary)...");

const mongod = await MongoMemoryServer.create({
  instance: { port: PORT, dbPath, storageEngine: "wiredTiger" },
});

console.log(`\n✅ MongoDB listening at ${mongod.getUri()}`);
console.log(`   Data directory: ${dbPath}`);
console.log("   Press Ctrl+C to stop.\n");

async function shutdown() {
  console.log("\nStopping MongoDB (keeping data)...");
  // doCleanup:false -> keep the on-disk data for next time
  await mongod.stop({ doCleanup: false });
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
