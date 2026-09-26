import { useQuery } from '@tanstack/react-query';
import { supabase, type BoycottTarget, type DetaineeDeath, type Facility } from '../lib/supabase';

// Data refreshes once a day, so there's no reason to refetch within a session.
const STALE_TIME = 60 * 60 * 1000;

export function useFacilities() {
  return useQuery({
    queryKey: ['facilities'],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('facilities')
        .select('id, name, field_office, address, city, state, zip, latitude, longitude, phone, source_url, last_seen_at')
        .order('name');
      if (error) throw error;
      // Postgres `numeric` comes back as a string over PostgREST.
      return (data as Facility[]).map((f) => ({
        ...f,
        latitude: f.latitude == null ? null : Number(f.latitude),
        longitude: f.longitude == null ? null : Number(f.longitude),
      }));
    },
  });
}

export function useDeaths() {
  return useQuery({
    queryKey: ['detainee_deaths'],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('detainee_deaths')
        .select('id, name, date_of_death, fiscal_year, facility_name, source_url')
        .order('date_of_death', { ascending: false });
      if (error) throw error;
      return data as DetaineeDeath[];
    },
  });
}

export function useBoycottTargets() {
  return useQuery({
    queryKey: ['boycott_targets'],
    staleTime: STALE_TIME,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('boycott_targets')
        .select('id, company_name, reason, demand, alternatives, source_url')
        .order('company_name');
      if (error) throw error;
      return data as BoycottTarget[];
    },
  });
}
