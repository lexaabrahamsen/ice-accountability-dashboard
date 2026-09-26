import { fetchJson, sleep } from './http.ts';

/**
 * OpenStreetMap Nominatim — free, no key, but limited to 1 request/second and
 * requires an identifying User-Agent (set in http.ts). Only facilities that
 * don't have coordinates yet are geocoded, so steady-state runs make ~0 calls.
 */
const NOMINATIM = 'https://nominatim.openstreetmap.org/search';

type Place = { lat: string; lon: string };

type Addressable = { address: string; city: string | null; state: string | null; zip: string | null };

async function search(params: Record<string, string>): Promise<Place | null> {
  const qs = new URLSearchParams({ ...params, countrycodes: 'us', format: 'jsonv2', limit: '1' });
  const results = await fetchJson<Place[]>(`${NOMINATIM}?${qs}`);
  await sleep(1100);
  return results[0] ?? null;
}

export async function geocode(f: Addressable): Promise<{ latitude: number; longitude: number } | null> {
  // Some ice.gov addresses list two buildings ("East 10400 Rancho Rd | West 10250 Rancho Rd"); use the first.
  const street = f.address.split('|')[0].trim();

  const hit =
    (await search({ street, city: f.city ?? '', state: f.state ?? '', postalcode: f.zip ?? '' })) ??
    // Fall back to the town centre so the facility still lands on the map.
    (f.city || f.zip ? await search({ city: f.city ?? '', state: f.state ?? '', postalcode: f.zip ?? '' }) : null);

  return hit ? { latitude: Number(hit.lat), longitude: Number(hit.lon) } : null;
}
