import { Pool } from "pg";

const email = process.argv[2];
if (!email) {
  console.error("Usage: npx tsx scripts/set-pro-tier.ts <email>");
  process.exit(1);
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("ERROR: DATABASE_URL environment variable is not set.");
  process.exit(1);
}

async function main() {
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    const result = await pool.query(
      `UPDATE profiles
       SET tier = 'pro',
           trial_ends_at = NULL,
           monthly_counter_reset_at = DATE_TRUNC('month', NOW()) + INTERVAL '1 month',
           monthly_exports_used = 0,
           updated_at = NOW()
       WHERE email = $1
       RETURNING user_id, email, tier`,
      [email]
    );

    if (result.rowCount === 0) {
      console.error(`No profile found for email: ${email}`);
      process.exit(1);
    }

    const row = result.rows[0];
    console.log(`Updated ${row.email} (userId: ${row.user_id}) to tier: ${row.tier}`);
  } finally {
    await pool.end();
  }
}

main();
