import { Pool } from "pg";

async function verifyTestUser() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("ERROR: DATABASE_URL environment variable is not set.");
    process.exit(1);
  }

  const email = process.argv[2];
  if (!email) {
    console.error("Usage: npx tsx scripts/verify-test-user.ts <email>");
    console.error("Example: npx tsx scripts/verify-test-user.ts test@example.com");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  try {
    console.log(`Verifying test user: ${email}`);

    // Update BetterAuth's user table to set emailVerified=true
    const result = await pool.query(
      `UPDATE "user" SET "emailVerified" = true WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      console.error(`No user found with email: ${email}`);
      console.error("Make sure the user has registered first.");
      process.exit(1);
    }

    console.log(`Done. Email verification bypassed for: ${email}`);
    console.log(`  Rows updated: ${result.rowCount}`);
  } catch (err) {
    console.error("Failed to verify test user:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verifyTestUser();
