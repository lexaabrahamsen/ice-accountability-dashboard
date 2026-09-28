# ICE Accountability Dashboard

A public-interest data dashboard showing three datasets:

1. **Detention facilities.** Every facility ICE lists, on a map.
2. **Deaths in ICE custody, FY2021 to present.** A list with charts, each row linked to ICE's own detainee death report.
3. **Corporate boycott targets.** Companies named by public boycott campaigns over their ICE contracts.

All data comes from official or institutional sources, never crowdsourced. A GitHub Action refreshes it daily.

## Scope

This project covers **facilities, deaths in custody, and companies**. It deliberately excludes:

- Data about individual ICE or CBP agents of any kind: identities, alleged records, or photos.
- "Incident" data tied to named individuals.
- theicelist.org or any of its subpages, as a data source.

This is a firm constraint, not a placeholder or a to-do. Contributions that add any of the above won't be accepted.

## Data sources

| Dataset | Source | Natural key |
| --- | --- | --- |
| Facilities | [ice.gov/detention-facilities](https://www.ice.gov/detention-facilities): name, field office, address, phone | `name` + `address` |
| Deaths | [ice.gov/detain/detainee-death-reporting](https://www.ice.gov/detain/detainee-death-reporting): name, date of death, fiscal year, report link | `name` + `date_of_death` |
| Boycott targets | Public boycott-campaign pages, curated in [`data/boycott-targets.json`](data/boycott-targets.json). Companies only; every entry must cite its `source_url` | `company_name` |

Facility coordinates come from [OpenStreetMap Nominatim](https://nominatim.org/), which is free, needs no API key, and is rate-limited to 1 request per second. Only facilities without coordinates get geocoded, so a normal daily run makes no geocoding calls.

**Known gap:** ICE's death summary page doesn't list the facility for each death. That detail is only in each linked PDF report, so `facility_name` starts out empty and the "deaths by facility" chart shows an explanatory note until it's filled in.

## Architecture

```
ice.gov pages ─┐
               ├─► scraper/ (Node + Cheerio) ─► Supabase Postgres ─► React app (anon key, read-only)
boycott JSON ──┘        ▲ daily GitHub Action
```

- **Frontend:** React, TypeScript, Vite, Chakra UI, TanStack Query, TanStack Table v9
- **Map:** react-leaflet with OpenStreetMap tiles
- **Charts:** Recharts
- **Database:** Supabase (Postgres). Row-level security gives the public anon key read-only access.
- **Refresh:** [`.github/workflows/refresh-data.yml`](.github/workflows/refresh-data.yml) upserts on each table's natural key and bumps `last_seen_at` on matched rows. Action logs serve as the change history, so there's no audit table.

## Setup

### 1. Supabase

Create a project, then run [`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) in the SQL editor.

### 2. Local environment

```sh
nvm use                     # Node 24
npm install
cp .env.example .env.local  # fill in the four values
```

### 3. Scraper

```sh
npm run scrape:dry   # parse the live pages and print counts; no database needed
npm run scrape       # upsert to Supabase (loads SUPABASE_* from your shell environment)
```

To run against Supabase locally: `set -a; source .env.local; set +a; npm run scrape`.

The first full run geocodes about 160 facilities at 1 request per second, which takes about 3 minutes.

### 4. GitHub Action

Add two repository secrets under **Settings → Secrets and variables → Actions**: `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`. Then run **Refresh data** once from the Actions tab. After that it runs on its own every day.

### 5. Frontend

```sh
npm run dev
```

To deploy on **Vercel**, import the repo (it detects Vite automatically) and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in the project's environment variables.

## Adding boycott targets

Add entries to [`data/boycott-targets.json`](data/boycott-targets.json):

```json
[
  {
    "company_name": "Example Corp",
    "reason": "Why the campaign targets this company",
    "demand": "What the campaign asks the company to do",
    "alternatives": "Suggested alternatives, if the campaign lists any",
    "source_url": "https://campaign-site.example/page"
  }
]
```

`company_name` and `source_url` are required. The next scheduled run (or a manual one) upserts the changes.
