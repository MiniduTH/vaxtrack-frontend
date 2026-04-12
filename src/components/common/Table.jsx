import React from 'react';
import Spinner from './Spinner';
import EmptyState from './EmptyState';

/**
 * Reusable data table component.
 *
 * @param {Object[]} columns  - [{ key, label, render?: (value, row) => ReactNode, className?: string }]
 * @param {Object[]} data     - Array of row objects
 * @param {boolean}  loading  - Show loading skeleton
 * @param {string}   emptyMessage - Displayed when data is empty
 */
const Table = ({
  columns = [],
  data = [],
  loading = false,
  emptyMessage = 'No data found.',
  className = '',
}) => {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!data.length) {
    return <EmptyState title={emptyMessage} />;
  }

  return (
    <div className={`overflow-x-auto rounded-xl border border-border shadow-soft ${className}`}>
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-secondary-50 dark:bg-slate-800/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                scope="col"
                className={`px-4 py-3 text-left text-xs font-semibold text-secondary-500 dark:text-slate-400 uppercase tracking-wider ${col.className ?? ''}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {data.map((row, rowIdx) => (
            <tr
              key={row._id ?? rowIdx}
              className="hover:bg-secondary-50/50 dark:hover:bg-slate-800/30 transition-colors duration-150"
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-4 py-3 text-sm text-foreground whitespace-nowrap ${col.cellClassName ?? ''}`}
                >
                  {col.render
                    ? col.render(row[col.key], row)
                    : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
