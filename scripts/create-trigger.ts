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

async function createTrigger() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log("Creating profile auto-creation trigger...");
    await pool.query(TRIGGER_SQL);
    console.log("  Created function: create_profile_on_user_insert()");
    console.log("  Created trigger: trigger_create_profile ON \"user\"");
    console.log("Done. Profile trigger is active.");
  } catch (err) {
    console.error("Failed to create trigger:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

createTrigger();
