-- ICE Accountability Dashboard — initial schema.
-- Run once in the Supabase SQL editor (or `supabase db push`).

create table facilities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  field_office text,
  address text not null,
  city text,
  state text,
  zip text,
  latitude numeric,
  longitude numeric,
  phone text,
  source_url text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint facilities_natural_key unique (name, address)
);

create table detainee_deaths (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  date_of_death date not null,
  fiscal_year text not null,
  facility_name text,
  facility_id uuid references facilities(id),
  source_url text not null,
  first_seen_at timestamptz not null default now(),
  constraint detainee_deaths_natural_key unique (name, date_of_death)
);

create table boycott_targets (
  id uuid primary key default gen_random_uuid(),
  company_name text not null,
  reason text,
  demand text,
  alternatives text,
  source_url text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  constraint boycott_targets_natural_key unique (company_name)
);

-- Public read-only access for the frontend (anon key).
-- Writes happen only from the scraper, which uses the service-role key and bypasses RLS.
alter table facilities enable row level security;
alter table detainee_deaths enable row level security;
alter table boycott_targets enable row level security;

create policy "public read" on facilities for select to anon using (true);
create policy "public read" on detainee_deaths for select to anon using (true);
create policy "public read" on boycott_targets for select to anon using (true);
