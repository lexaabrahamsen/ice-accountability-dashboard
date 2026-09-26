import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example).');
  return createClient(url, key, { auth: { persistSession: false } });
}

export type AdminClient = ReturnType<typeof createAdminClient>;

/**
 * Upsert on the table's natural key. Columns left out of `rows` (id,
 * first_seen_at, lat/lng) are untouched on match and defaulted on insert.
 */
export async function upsert<T extends object>(
  db: AdminClient,
  table: string,
  onConflict: string,
  rows: T[],
  { touchLastSeen = true } = {},
): Promise<number> {
  if (rows.length === 0) return 0;
  const now = new Date().toISOString();
  const payload = touchLastSeen ? rows.map((r) => ({ ...r, last_seen_at: now })) : rows;

  const { error, count } = await db.from(table).upsert(payload, { onConflict, count: 'exact' });
  if (error) throw new Error(`upsert ${table}: ${error.message}`);
  return count ?? rows.length;
}
