/**
 * Daily data refresh: fetch official sources → parse → upsert to Supabase.
 *
 *   npm run scrape:dry   # parse live pages and print a summary; no DB needed
 *   npm run scrape       # full run (needs SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY)
 *
 * GitHub Action logs are the change history, so every step logs its counts.
 */
import { loadBoycottTargets } from './boycott.ts';
import { createAdminClient, upsert, type AdminClient } from './db.ts';
import { scrapeDeaths } from './deaths.ts';
import { scrapeFacilities } from './facilities.ts';
import { geocode } from './geocode.ts';

const dryRun = process.argv.includes('--dry-run');

async function geocodeMissing(db: AdminClient) {
  const { data, error } = await db
    .from('facilities')
    .select('id, name, address, city, state, zip')
    .is('latitude', null);
  if (error) throw new Error(`select facilities: ${error.message}`);

  let found = 0;
  for (const f of data) {
    const coords = await geocode(f);
    if (!coords) {
      console.warn(`[geocode] no match: ${f.name} — ${f.address}, ${f.city}, ${f.state}`);
      continue;
    }
    const { error: updateError } = await db.from('facilities').update(coords).eq('id', f.id);
    if (updateError) throw new Error(`update facility ${f.id}: ${updateError.message}`);
    found++;
  }
  console.log(`[geocode] ${found}/${data.length} facilities geocoded`);
}

async function main() {
  const [facilities, deaths, boycott] = await Promise.all([
    scrapeFacilities(),
    scrapeDeaths(),
    loadBoycottTargets(),
  ]);
  console.log(`[parse] facilities=${facilities.length} deaths=${deaths.length} boycott_targets=${boycott.length}`);

  if (dryRun) {
    const perYear = Object.groupBy(deaths, (d) => d.fiscal_year);
    for (const [fy, rows] of Object.entries(perYear)) console.log(`  ${fy}: ${rows?.length}`);
    console.log('[sample] facility', facilities[0]);
    console.log('[sample] death', deaths[0]);
    return;
  }

  const db = createAdminClient();
  console.log(`[upsert] facilities: ${await upsert(db, 'facilities', 'name,address', facilities)}`);
  // detainee_deaths has no last_seen_at column — a death record is immutable once reported.
  console.log(
    `[upsert] detainee_deaths: ${await upsert(db, 'detainee_deaths', 'name,date_of_death', deaths, { touchLastSeen: false })}`,
  );
  console.log(`[upsert] boycott_targets: ${await upsert(db, 'boycott_targets', 'company_name', boycott)}`);
  await geocodeMissing(db);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
