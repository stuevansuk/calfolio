import { execFileSync } from "child_process";
import { Pool } from "pg";

const TABLES_TO_DROP = [
  "feedback_votes",
  "feedback",
  "exit_surveys",
  "deleted_emails",
  "webhook_events",
  "image_uploads",
  "print_orders",
  "calendar_pages",
  "calendar_projects",
  "calendar_templates",
  "profiles",
  // BetterAuth tables
  "session",
  "account",
  "verification",
  '"user"',
];

async function resetDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  // Require --force flag
  if (!process.argv.includes("--force")) {
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    console.error("!!! WARNING: This will DESTROY ALL DATA.     !!!");
    console.error("!!! Run with --force to confirm.             !!!");
    console.error("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    process.exit(1);
  }

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
  console.log("!!! DESTRUCTIVE RESET - ALL DATA WILL BE LOST  ");
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\n");

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    // Step 1: Drop trigger and function
    console.log("Step 1: Dropping trigger and function...");
    await pool.query('DROP TRIGGER IF EXISTS trigger_create_profile ON "user"');
    await pool.query("DROP FUNCTION IF EXISTS create_profile_on_user_insert()");
    console.log("  Trigger and function dropped.\n");

    // Step 2: Drop all tables
    console.log("Step 2: Dropping all tables...");
    for (const table of TABLES_TO_DROP) {
      const tableName = table.startsWith('"') ? table : `"${table}"`;
      try {
        await pool.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        console.log(`  Dropped: ${table}`);
      } catch {
        // Table may not exist, that's fine
        console.log(`  Skipped (not found): ${table}`);
      }
    }
    console.log("  All tables dropped.\n");

    // Also drop drizzle migration tracking table if it exists
    await pool.query('DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE');
    await pool.query('DROP TABLE IF EXISTS "drizzle"."__drizzle_migrations" CASCADE');
    await pool.query("DROP SCHEMA IF EXISTS drizzle CASCADE");
    console.log("  Drizzle migration tracking cleaned.\n");
  } catch (err) {
    console.error("Failed during table drop:", err);
    await pool.end();
    process.exit(1);
  }

  await pool.end();

  // Step 3: Re-initialize
  console.log("Step 3: Re-initializing database...");
  try {
    execFileSync("npx", ["tsx", "scripts/init-db.ts"], { stdio: "inherit" });
  } catch (err) {
    console.error("Failed to re-initialize database:", err);
    process.exit(1);
  }

  console.log("\nDatabase reset complete.");
  process.exit(0);
}

resetDb();
