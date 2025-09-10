import { sql } from "@/lib/db";

async function initializeDatabase() {
  try {
    console.log("Initializing database tables...");

    try {
      const testResult = await sql`SELECT NOW() as current_time`;
      console.log("Database connection test:", testResult);
    } catch (error) {
      console.log("Database connection test failed");
    }

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

    console.log("Database tables created successfully!");
  } catch (error) {
    console.error("Error initializing database:", error);
  }
}

if (require.main === module) {
  initializeDatabase();
}

export { initializeDatabase };
