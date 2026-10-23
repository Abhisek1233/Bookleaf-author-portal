import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:root@localhost:5432/bookleaf_support?schema=public';

// Render internal network (dpg-*) does not use SSL; external connections require SSL
const isInternalRender = connectionString.includes('dpg-') && !connectionString.includes('.render.com');
const isExternalSSL = connectionString.includes('.render.com') || connectionString.includes('neon.tech') || connectionString.includes('ssl=true') || connectionString.includes('sslmode=require');

const sslConfig = !isInternalRender && isExternalSSL ? { rejectUnauthorized: false } : false;

try {
  const parsed = new URL(connectionString);
  console.log(`[Database] Connecting to PostgreSQL host: ${parsed.hostname}:${parsed.port || 5432}, db: ${parsed.pathname}, ssl: ${Boolean(sslConfig)}`);
} catch {
  console.log('[Database] Initializing database pool with custom connection string');
}

export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err);
});

export const query = (text, params) => pool.query(text, params);
