import type { UseQueryResult } from '@tanstack/react-query';
import type { ReactNode } from 'react';

/** Loading / error states shared by every section. */
export function QueryState({ query, children }: { query: UseQueryResult<unknown>; children: ReactNode }) {
  if (query.isPending) return <p className="muted" role="status">Loading…</p>;
  if (query.isError) {
    return (
      <p className="error" role="alert">
        Couldn't load this data: {query.error.message}
      </p>
    );
  }
  return children;
}
