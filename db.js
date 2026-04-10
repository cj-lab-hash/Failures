import pg from "pg";
const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes("localhost") ? false : { rejectUnauthorized: false }
});

export async function query(text, params) {
  const client = await pool.connect();
  try {
    // Optional schema isolation
    const schema = process.env.DB_SCHEMA || "public";
    await client.query(`SET search_path TO ${schema}`);
    return await client.query(text, params);
  } finally {
    client.release();
  }
}