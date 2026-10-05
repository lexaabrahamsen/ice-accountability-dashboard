import { Box, Heading, SimpleGrid, Stat, Text } from '@chakra-ui/react';
import { useMemo } from 'react';
import { BoycottSection } from './components/BoycottSection';
import { DeathsSection } from './components/DeathsSection';
import { FacilityMap } from './components/FacilityMap';
import { useDeaths, useFacilities } from './hooks/queries';

function StatCard({ label, value, big }: { label: string; value: string | number; big?: boolean }) {
  return (
    <Stat.Root
      gridColumn={big ? { base: '1 / -1', md: 'span 1' } : undefined}
      bg="bgSubtle"
      borderWidth="1px"
      borderColor="border"
      borderRadius="xl"
      px={5}
      py={4}
    >
      <Stat.Label fontFamily="heading" color="fgMuted" fontSize="sm">
        {label}
      </Stat.Label>
      <Stat.ValueText fontFamily="body" color="fg" fontSize="5xl" fontWeight="semibold" lineHeight="1.1">
        {value}
      </Stat.ValueText>
    </Stat.Root>
  );
}

function Stats() {
  const facilities = useFacilities();
  const deaths = useDeaths();

  const latestFy = useMemo(() => {
    const years = (deaths.data ?? []).map((d) => d.fiscal_year).sort();
    const fy = years.at(-1);
    return fy ? { fy, count: years.filter((y) => y === fy).length } : null;
  }, [deaths.data]);

  const lastUpdated = useMemo(() => {
    const times = (facilities.data ?? []).map((f) => f.last_seen_at).sort();
    return times.at(-1) ? new Date(times.at(-1)!).toLocaleDateString('en-US', { dateStyle: 'medium' }) : null;
  }, [facilities.data]);

  return (
    <SimpleGrid columns={{ base: 2, md: 3 }} gap={3}>
      <StatCard big label="Deaths in ICE custody since FY2021" value={deaths.data?.length ?? '—'} />
      <StatCard label={latestFy ? `In ${latestFy.fy} so far` : 'This fiscal year'} value={latestFy?.count ?? '—'} />
      <StatCard label="Detention facilities listed" value={facilities.data?.length ?? '—'} />
      {lastUpdated && (
        <Text gridColumn="1 / -1" fontFamily="heading" color="fgMuted" fontSize="sm" m={0}>
          Data last refreshed {lastUpdated}
        </Text>
      )}
    </SimpleGrid>
  );
}

const NAV_LINKS = [
  { href: '#facilities', label: 'Detention facilities' },
  { href: '#deaths', label: 'Deaths in ICE custody' },
  { href: '#boycott', label: 'Corporate boycott targets' },
];

export function App() {
  return (
    <>
      <nav className="site-nav" aria-label="Sections">
        <ul className="wrap">
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              <a href={l.href}>{l.label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <Box as="header" borderBottomWidth="1px" borderColor="border" py={{ base: 10, md: 12 }}>
        <div className="wrap">
          <Heading as="h1" size="4xl" color="fg" mb={3}>
            ICE Accountability Dashboard
          </Heading>
          <Text color="fgMuted" maxW="68ch" m={0}>
            Where ICE detains people, who has died in its custody, and which companies profit from it. Drawn from official
            ICE publications and public boycott campaigns. Refreshed daily.
          </Text>
        </div>
      </Box>
      <main className="wrap" style={{ paddingTop: 32 }}>
        <Stats />
        <FacilityMap />
        <DeathsSection />
        <BoycottSection />
      </main>
      <Box as="footer" borderTopWidth="1px" borderColor="border" py={{ base: 6, md: 8 }}>
        <Text className="wrap" color="fgMuted" fontSize="sm">
          Sources: <a href="https://www.ice.gov/detention-facilities" target="_blank" rel="noopener noreferrer">ICE detention facilities</a>,{' '}
          <a href="https://www.ice.gov/detain/detainee-death-reporting" target="_blank" rel="noopener noreferrer">ICE detainee death reporting</a>, and the boycott
          campaigns cited in each row. Map data © OpenStreetMap contributors.
        </Text>
      </Box>
    </>
  );
}
