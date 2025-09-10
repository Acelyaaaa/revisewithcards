// lib/db.ts
// DO NOT: import "server-only";
try { require("server-only"); } catch { /* ignore for Node scripts */ }

import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set");

export const sql = neon(connectionString);
