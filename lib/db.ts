import { neon } from "@neondatabase/serverless";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL environment variable is not set");

export const sql = neon(connectionString);

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS user_quotas (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) UNIQUE NOT NULL,
        uploadsThisMonth INTEGER DEFAULT 0,
        lastReset TIMESTAMP DEFAULT NOW(),
        plan VARCHAR(50) DEFAULT 'free',
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS user_flashcards (
        id SERIAL PRIMARY KEY,
        userId VARCHAR(255) NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        fileUrl TEXT NOT NULL,
        flashcards JSONB NOT NULL,
        createdAt TIMESTAMP DEFAULT NOW(),
        updatedAt TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log("Database tables initialized successfully");
  } catch (e) {
    console.error("Database initialization error:", e);
  }
}
initDatabase();
