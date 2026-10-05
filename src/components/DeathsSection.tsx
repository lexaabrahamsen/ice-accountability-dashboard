import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { useDeaths } from '../hooks/queries';
import type { DetaineeDeath } from '../lib/supabase';
import { DataTable, type Features } from './DataTable';
import { QueryState } from './QueryState';

const helper = createColumnHelper<Features, DetaineeDeath>();

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });

const columns = helper.columns([
  helper.accessor('date_of_death', { header: 'Date of death', cell: (c) => formatDate(c.getValue()) }),
  helper.accessor('name', { header: 'Name' }),
  helper.accessor('fiscal_year', { header: 'Fiscal year' }),
  helper.accessor('facility_name', { header: 'Facility', cell: (c) => c.getValue() ?? '—' }),
  helper.accessor('source_url', {
    header: 'ICE report',
    enableSorting: false,
    enableGlobalFilter: false,
    cell: (c) => (
      <a href={c.getValue()} target="_blank" rel="noopener noreferrer">
        Report<span className="visually-hidden"> for {c.row.original.name}</span> ↗
      </a>
    ),
  }),
]);

type Datum = { label: string; count: number };

/** "FY 2026" → "FY26" so every year fits on a phone-width axis. */
const shortFiscalYear = (label: string) => label.replace(/^FY\s*\d{2}(\d{2})$/, 'FY$1');

function ChartTooltip({ active, payload }: TooltipContentProps<ValueType, NameType>) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Datum;
  return (
    <div className="chart-tooltip">
      <div className="muted small">{d.label}</div>
      <strong>
        {d.count} {d.count === 1 ? 'death' : 'deaths'}
      </strong>
    </div>
  );
}

function CountChart({ data, layout }: { data: Datum[]; layout: 'columns' | 'bars' }) {
  const horizontal = layout === 'bars';
  return (
    <ResponsiveContainer width="100%" height={horizontal ? Math.max(200, data.length * 32) : 260}>
      <BarChart
        data={data}
        layout={horizontal ? 'vertical' : 'horizontal'}
        margin={{ top: 20, right: 24, bottom: 0, left: 0 }}
        barCategoryGap={4}
      >
        <CartesianGrid horizontal={!horizontal} vertical={horizontal} />
        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} className="chart-axis" tickLine={false} axisLine={false} />
            <YAxis type="category" dataKey="label" width={220} className="chart-axis" tickLine={false} axisLine={false} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" className="chart-axis" tickLine={false} tickFormatter={shortFiscalYear} interval={0} />
            <YAxis allowDecimals={false} width={32} className="chart-axis" tickLine={false} axisLine={false} />
          </>
        )}
        <Tooltip content={ChartTooltip} cursor={{ className: 'chart-cursor' }} />
        <Bar
          dataKey="count"
          className="chart-bar"
          maxBarSize={24}
          radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
          label={{ position: horizontal ? 'right' : 'top', className: 'chart-label' }}
          isAnimationActive={false}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function DeathsSection() {
  const query = useDeaths();
  const deaths = query.data ?? EMPTY;

  const byYear = useMemo(() => countBy(deaths, (d) => d.fiscal_year).sort((a, b) => a.label.localeCompare(b.label)), [deaths]);
  const byFacility = useMemo(
    () =>
      countBy(
        deaths.filter((d) => d.facility_name),
        (d) => d.facility_name!,
      )
        .sort((a, b) => b.count - a.count)
        .slice(0, 15),
    [deaths],
  );

  return (
    <section id="deaths" aria-labelledby="deaths-title">
      <h2 id="deaths-title">Deaths in ICE custody</h2>
      <p className="lede">
        Every death ICE has reported since FY2021, per its{' '}
        <a href="https://www.ice.gov/detain/detainee-death-reporting" target="_blank" rel="noopener noreferrer">
          detainee death reporting
        </a>{' '}
        page. Federal fiscal years run October to September.
      </p>
      <QueryState query={query}>
        <div className="charts">
          <figure className="card">
            <figcaption>Deaths per fiscal year</figcaption>
            <CountChart data={byYear} layout="columns" />
          </figure>
          <figure className="card">
            <figcaption>Deaths by facility (top 15)</figcaption>
            {byFacility.length > 0 ? (
              <CountChart data={byFacility} layout="bars" />
            ) : (
              <p className="muted">
                ICE's summary page doesn't list facilities; they appear in each linked death report. This chart fills in as
                facility names are added.
              </p>
            )}
          </figure>
        </div>
        <DataTable
          data={deaths}
          columns={columns}
          searchLabel="Search by name, year, or facility"
          initialSorting={[{ id: 'date_of_death', desc: true }]}
        />
      </QueryState>
    </section>
  );
}

const EMPTY: DetaineeDeath[] = [];

function countBy<T>(items: T[], key: (item: T) => string): Datum[] {
  const counts = new Map<string, number>();
  for (const item of items) counts.set(key(item), (counts.get(key(item)) ?? 0) + 1);
  return [...counts].map(([label, count]) => ({ label, count }));
}
