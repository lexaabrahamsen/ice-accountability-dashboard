import { readFile } from 'node:fs/promises';
import { clean } from './http.ts';

/**
 * Boycott targets come from a curated file rather than a scraper: each entry is
 * copied from a public boycott-campaign page and must cite it in `source_url`.
 * Companies only — never individuals.
 */
const DATA_FILE = new URL('../data/boycott-targets.json', import.meta.url);

export type BoycottRow = {
  company_name: string;
  reason: string | null;
  demand: string | null;
  alternatives: string | null;
  source_url: string;
};

export async function loadBoycottTargets(): Promise<BoycottRow[]> {
  const raw = JSON.parse(await readFile(DATA_FILE, 'utf8')) as Partial<BoycottRow>[];

  return raw.map((entry, i) => {
    const company_name = clean(entry.company_name);
    const source_url = clean(entry.source_url);
    if (!company_name || !source_url) {
      throw new Error(`boycott-targets.json[${i}] needs both company_name and source_url`);
    }
    return {
      company_name,
      reason: clean(entry.reason) || null,
      demand: clean(entry.demand) || null,
      alternatives: clean(entry.alternatives) || null,
      source_url,
    };
  });
}
