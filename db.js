require('dotenv').config();
const { Pool } = require('pg');

const config = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: process.env.PGPORT || 5432,
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
      database: process.env.PGDATABASE || 'failures_db'
    };

// Only set ssl object if your connection string does NOT already include sslmode
if (process.env.NODE_ENV === 'production' && !(process.env.DATABASE_URL || '').includes('sslmode=')) {
  config.ssl = { rejectUnauthorized: false };
}

const pool = new Pool(config);

module.exports = pool;
