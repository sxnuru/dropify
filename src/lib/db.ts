import pg from 'pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('[db] Missing DATABASE_URL env var.');
}

export const pool = new pg.Pool({
  connectionString,
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (duration > 100) {
      console.log(`[db] Slow query (${duration}ms):`, text.substring(0, 100));
    }
    return res;
  } catch (error) {
    console.error(`[db] Query error:`, error);
    throw error;
  }
}

export async function getClient() {
  const client = await pool.connect();
  const query = client.query;
  const release = client.release;
  return { client, query: query.bind(client), release: release.bind(client) };
}
