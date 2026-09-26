import * as cheerio from 'cheerio';
import { clean, fetchText, sleep } from './http.ts';

const BASE = 'https://www.ice.gov';
const LIST_URL = `${BASE}/detention-facilities`;
const MAX_PAGES = 50; // safety stop; the listing is ~8 pages today

export type FacilityRow = {
  name: string;
  field_office: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  phone: string | null;
  source_url: string;
};

export function parseFacilitiesPage(html: string): FacilityRow[] {
  const $ = cheerio.load(html);
  const rows: FacilityRow[] = [];

  $('ul.blazy--view--detention-facilities li.grid').each((_, el) => {
    const item = $(el);
    const name = clean(item.find('.views-field-title .field-content').first().text());
    const address = clean(item.find('.address-line1').text());
    if (!name || !address) return;

    const href = item.find('.views-field-title-1 a').attr('href');
    rows.push({
      name,
      field_office: clean(item.find('.views-field-field-field-office-name .field-content').text()) || null,
      address,
      city: clean(item.find('.locality').text()) || null,
      state: clean(item.find('.administrative-area').text()) || null,
      zip: clean(item.find('.postal-code').text()) || null,
      phone: clean(item.find('.views-field-field-phone-number .field-content').text()) || null,
      source_url: href ? new URL(href, BASE).toString() : LIST_URL,
    });
  });

  return rows;
}

export async function scrapeFacilities(): Promise<FacilityRow[]> {
  const all: FacilityRow[] = [];
  for (let page = 0; page < MAX_PAGES; page++) {
    const rows = parseFacilitiesPage(await fetchText(`${LIST_URL}?page=${page}`));
    if (rows.length === 0) break;
    all.push(...rows);
    await sleep(500); // be polite to ice.gov
  }
  if (all.length === 0) throw new Error('Parsed 0 facilities — ice.gov markup may have changed.');

  // The same facility can appear on two pages if the listing shifts mid-crawl.
  const byKey = new Map(all.map((f) => [`${f.name}|${f.address}`, f]));
  return [...byKey.values()];
}
