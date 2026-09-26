import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY — copy .env.example to .env.local.');
}

export const supabase = createClient(url, anonKey, { auth: { persistSession: false } });

export type Facility = {
  id: string;
  name: string;
  field_office: string | null;
  address: string;
  city: string | null;
  state: string | null;
  zip: string | null;
  latitude: number | null;
  longitude: number | null;
  phone: string | null;
  source_url: string;
  last_seen_at: string;
};

export type DetaineeDeath = {
  id: string;
  name: string;
  date_of_death: string;
  fiscal_year: string;
  facility_name: string | null;
  source_url: string;
};

export type BoycottTarget = {
  id: string;
  company_name: string;
  reason: string | null;
  demand: string | null;
  alternatives: string | null;
  source_url: string;
};
