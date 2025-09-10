// scripts/migrate.ts
import { sql } from "@/lib/db";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

(async () => {
  const ddl = readFileSync(resolve(process.cwd(), "scripts/migrate.sql"), "utf8");
  await sql(ddl as any);
  // eslint-disable-next-line no-console
  console.log("✅ Database migrated");
})();
