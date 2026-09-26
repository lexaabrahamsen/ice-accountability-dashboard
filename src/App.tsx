import { useMemo } from 'react';
import { BoycottSection } from './components/BoycottSection';
import { DeathsSection } from './components/DeathsSection';
import { FacilityMap } from './components/FacilityMap';
import { useDeaths, useFacilities } from './hooks/queries';

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
    <dl className="stats">
      <div className="stat hero">
        <dt>Deaths in ICE custody since FY2021</dt>
        <dd>{deaths.data?.length ?? '—'}</dd>
      </div>
      <div className="stat">
        <dt>{latestFy ? `In ${latestFy.fy} so far` : 'This fiscal year'}</dt>
        <dd>{latestFy?.count ?? '—'}</dd>
      </div>
      <div className="stat">
        <dt>Detention facilities listed</dt>
        <dd>{facilities.data?.length ?? '—'}</dd>
      </div>
      {lastUpdated && <p className="muted small stats-note">Data last refreshed {lastUpdated}</p>}
    </dl>
  );
}

export function App() {
  return (
    <>
      <header className="site-header">
        <div className="wrap">
          <h1>ICE Accountability Dashboard</h1>
          <p className="lede">
            Where ICE detains people, who has died in its custody, and which companies profit from it. Drawn from official
            ICE publications and public boycott campaigns. Refreshed daily.
          </p>
        </div>
      </header>
      <main className="wrap">
        <Stats />
        <FacilityMap />
        <DeathsSection />
        <BoycottSection />
      </main>
      <footer className="wrap site-footer muted small">
        <p>
          Sources: <a href="https://www.ice.gov/detention-facilities">ICE detention facilities</a>,{' '}
          <a href="https://www.ice.gov/detain/detainee-death-reporting">ICE detainee death reporting</a>, and the boycott
          campaigns cited in each row. Map data © OpenStreetMap contributors.
        </p>
      </footer>
    </>
  );
}
