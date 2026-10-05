import {
  createFilteredRowModel,
  createSortedRowModel,
  filterFn_includesString,
  globalFilteringFeature,
  rowSortingFeature,
  sortFns,
  tableFeatures,
  useTable,
  columnFilteringFeature,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { Search } from 'lucide-react';
import { useState } from 'react';

export const tableFeatureSet = tableFeatures({
  columnFilteringFeature,
  globalFilteringFeature,
  rowSortingFeature,
  filteredRowModel: createFilteredRowModel(),
  sortedRowModel: createSortedRowModel(),
  filterFns: { includesString: filterFn_includesString },
  sortFns,
});

export type Features = typeof tableFeatureSet;

type Props<T extends object> = {
  data: T[];
  columns: ColumnDef<Features, T, any>[];
  searchLabel: string;
  initialSorting?: SortingState;
};

/** Sortable, searchable table shared by the deaths and boycott views. */
export function DataTable<T extends object>({ data, columns, searchLabel, initialSorting = [] }: Props<T>) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [sorting, setSorting] = useState<SortingState>(initialSorting);

  const table = useTable({
    features: tableFeatureSet,
    columns,
    data,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    globalFilterFn: 'includesString',
  });

  const rows = table.getRowModel().rows;

  return (
    <div className="table-block">
      <label className="search">
        <span className="visually-hidden">{searchLabel}</span>
        <Search className="search-icon" size={16} aria-hidden="true" />
        <input
          type="search"
          placeholder={`${searchLabel}…`}
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
        />
      </label>
      <div className="table-scroll">
        <table>
          <thead>
            {table.getHeaderGroups().map((group) => (
              <tr key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted();
                  return (
                    <th
                      key={header.id}
                      aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button type="button" className="sort" onClick={header.column.getToggleSortingHandler()}>
                          <table.FlexRender header={header} />
                          <span aria-hidden="true" className="sort-mark">
                            {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : ''}
                          </span>
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                {row.getAllCells().map((cell) => (
                  <td key={cell.id}>
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 && <p className="empty">No matching rows.</p>}
      </div>
      <p className="muted small">
        {rows.length} of {data.length} rows
      </p>
    </div>
  );
}
