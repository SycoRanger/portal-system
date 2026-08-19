import { TableSkeleton } from './Skeleton';
import ErrorState from './ErrorState';

export default function DataTable({ columns, data, loading, error, onRetry, empty, keyField = 'id' }) {
  if (loading) return <TableSkeleton cols={columns.length} />;
  if (error) return <ErrorState message={error} onRetry={onRetry} />;
  if (!data || data.length === 0) return empty || null;

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr key={row[keyField]} className="border-b border-border last:border-0 transition-colors hover:bg-surface-hover">
              {columns.map((col) => (
                <td key={col.key} className="px-4 py-3.5 align-middle text-ink">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
