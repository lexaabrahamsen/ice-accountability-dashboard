const USER_AGENT =
  'ice-accountability-dashboard/0.1 (public-interest data project; +https://github.com/lexaabrahamsen/ice-accountability-dashboard)';

export async function fetchText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.text();
}

export async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { headers: { 'User-Agent': USER_AGENT, Accept: 'application/json' } });
  if (!res.ok) throw new Error(`GET ${url} → ${res.status} ${res.statusText}`);
  return res.json() as Promise<T>;
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Collapse whitespace and non-breaking spaces that ice.gov markup is full of. */
export const clean = (s: string | undefined | null): string =>
  (s ?? '').replace(/ /g, ' ').replace(/\s+/g, ' ').trim();
