import clsx from 'clsx'
import { motion } from 'framer-motion'
import { TableSkeleton } from './Skeleton'
import EmptyState from './EmptyState'

export default function Table({ columns, data, loading, emptyTitle, emptyDescription, emptyAction, onRowClick, rowKey = 'id' }) {
  return (
    <div className="card-surface overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 dark:border-white/10">
              {columns.map((col) => (
                <th key={col.key} className="whitespace-nowrap px-5 py-3.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {!loading && data.length > 0 && (
            <tbody>
              {data.map((row, i) => (
                <motion.tr
                  key={row[rowKey] ?? i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 8) * 0.02 }}
                  onClick={() => onRowClick?.(row)}
                  className={clsx(
                    'border-b border-slate-50 last:border-0 dark:border-white/5',
                    onRowClick && 'cursor-pointer hover:bg-slate-50 dark:hover:bg-white/[0.03]'
                  )}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="whitespace-nowrap px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      {col.render ? col.render(row) : row[col.key]}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          )}
        </table>
      </div>
      {loading && (
        <div className="p-5">
          <TableSkeleton cols={columns.length} />
        </div>
      )}
      {!loading && data.length === 0 && (
        <EmptyState title={emptyTitle ?? 'No records yet'} description={emptyDescription} action={emptyAction} />
      )}
    </div>
  )
}
