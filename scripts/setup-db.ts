import { execFileSync } from "child_process";
import { Pool } from "pg";

const TRIGGER_SQL = `
CREATE OR REPLACE FUNCTION create_profile_on_user_insert()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (user_id, email, name, tier, trial_ends_at, monthly_counter_reset_at, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.name,
    'trial',
    NOW() + INTERVAL '7 days',
    (DATE_TRUNC('month', NOW()) + INTERVAL '1 month'),
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_create_profile ON "user";
CREATE TRIGGER trigger_create_profile
  AFTER INSERT ON "user"
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_user_insert();
`;

async function setupDb() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  console.log("=== Development Database Setup ===\n");

  // Step 1: Push schema via drizzle-kit
  console.log("Step 1: Pushing schema via drizzle-kit push...");
  try {
    execFileSync("npx", ["drizzle-kit", "push", "--force"], { stdio: "inherit" });
    console.log("  Schema push complete.\n");
  } catch (err) {
    console.error("Failed to push schema:", err);
    process.exit(1);
  }

  // Step 2: Create profile trigger
  console.log("Step 2: Creating profile auto-creation trigger...");
  const pool = new Pool({ connectionString: databaseUrl });
  try {
    await pool.query(TRIGGER_SQL);
    console.log("  Trigger created successfully.\n");
  } catch (err) {
    console.error("Failed to create trigger:", err);
    await pool.end();
    process.exit(1);
  }
  await pool.end();

  // Step 3: Seed templates
  console.log("Step 3: Seeding templates...");
  try {
    execFileSync("npx", ["tsx", "scripts/seed-templates.ts"], { stdio: "inherit" });
    console.log("  Templates seeded.\n");
  } catch (err) {
    console.error("Failed to seed templates:", err);
    process.exit(1);
  }

  console.log("=== Dev setup complete ===");
  process.exit(0);
}

setupDb();
