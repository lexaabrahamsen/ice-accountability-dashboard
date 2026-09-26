import * as cheerio from 'cheerio';
import { clean, fetchText } from './http.ts';

const BASE = 'https://www.ice.gov';
const SOURCE_URL = `${BASE}/detain/detainee-death-reporting`;

/** Project scope is FY2021 onward; the source page goes back further. */
export const MIN_FISCAL_YEAR = 2021;

export type DeathRow = {
  name: string;
  date_of_death: string; // YYYY-MM-DD
  fiscal_year: string; // e.g. "FY 2026"
  source_url: string; // ICE's detainee death report (PDF) when linked
};

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** "August 23, 2026" → "2026-08-23". Parsed by hand to avoid timezone drift. */
export function parseLongDate(s: string): string | null {
  const m = clean(s).match(/^([A-Za-z]+)\.?\s+(\d{1,2}),\s*(\d{4})$/);
  if (!m) return null;
  const month = MONTHS.findIndex((name) => name.startsWith(m[1].toLowerCase().slice(0, 3)));
  if (month < 0) return null;
  return `${m[3]}-${String(month + 1).padStart(2, '0')}-${m[2].padStart(2, '0')}`;
}

export function parseDeathsPage(html: string): DeathRow[] {
  const $ = cheerio.load(html);
  const rows: DeathRow[] = [];

  $('h3.accordion-title').each((_, heading) => {
    const fiscalYear = clean($(heading).text()); // "FY 2026"
    const year = Number(fiscalYear.match(/\d{4}/)?.[0]);
    if (!year || year < MIN_FISCAL_YEAR) return;

    $(heading)
      .next('.accordion-description')
      .find('tbody tr')
      .each((_, tr) => {
        const cells = $(tr).find('td');
        const date = parseLongDate(cells.eq(0).text());
        const name = clean(cells.eq(1).text());
        if (!date || !name) {
          console.warn(`[deaths] skipped unparseable row in ${fiscalYear}: ${clean($(tr).text())}`);
          return;
        }
        const href = cells.eq(1).find('a').attr('href');
        rows.push({
          name,
          date_of_death: date,
          fiscal_year: fiscalYear,
          source_url: href ? new URL(href, BASE).toString() : SOURCE_URL,
        });
      });
  });

  return rows;
}

export async function scrapeDeaths(): Promise<DeathRow[]> {
  const rows = parseDeathsPage(await fetchText(SOURCE_URL));
  if (rows.length === 0) throw new Error('Parsed 0 deaths — ice.gov markup may have changed.');
  const byKey = new Map(rows.map((d) => [`${d.name}|${d.date_of_death}`, d]));
  return [...byKey.values()];
}
