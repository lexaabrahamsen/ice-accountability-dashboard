import { createColumnHelper } from '@tanstack/react-table';
import { useBoycottTargets } from '../hooks/queries';
import type { BoycottTarget } from '../lib/supabase';
import { DataTable, type Features } from './DataTable';
import { QueryState } from './QueryState';

const helper = createColumnHelper<Features, BoycottTarget>();
const text = (v: string | null) => v ?? '—';

const columns = helper.columns([
  helper.accessor('company_name', { header: 'Company' }),
  helper.accessor('reason', { header: 'Why', enableSorting: false, cell: (c) => text(c.getValue()) }),
  helper.accessor('demand', { header: 'Demand', enableSorting: false, cell: (c) => text(c.getValue()) }),
  helper.accessor('alternatives', { header: 'Alternatives', enableSorting: false, cell: (c) => text(c.getValue()) }),
  helper.accessor('source_url', {
    header: 'Source',
    enableSorting: false,
    enableGlobalFilter: false,
    cell: (c) => (
      <a href={c.getValue()} target="_blank" rel="noopener noreferrer">
        Campaign<span className="visually-hidden"> for {c.row.original.company_name}</span> ↗
      </a>
    ),
  }),
]);

const EMPTY: BoycottTarget[] = [];

export function BoycottSection() {
  const query = useBoycottTargets();

  return (
    <section aria-labelledby="boycott-title">
      <h2 id="boycott-title">Corporate boycott targets</h2>
      <p className="lede">Companies named by public boycott campaigns over their ICE contracts. Each row links to its campaign source.</p>
      <QueryState query={query}>
        {query.data?.length === 0 ? (
          <p className="muted">No boycott targets have been added yet.</p>
        ) : (
          <DataTable
            data={query.data ?? EMPTY}
            columns={columns}
            searchLabel="Search companies"
            initialSorting={[{ id: 'company_name', desc: false }]}
          />
        )}
      </QueryState>
    </section>
  );
}
