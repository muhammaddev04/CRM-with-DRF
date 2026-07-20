import clsx from 'clsx'

export default function Skeleton({ className }) {
  return <div className={clsx('animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/[0.06]', className)} />
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div className="space-y-2.5">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-4">
          {Array.from({ length: cols }).map((__, c) => (
            <Skeleton key={c} className={clsx('h-9', c === 0 ? 'w-10 rounded-full' : 'flex-1')} />
          ))}
        </div>
      ))}
    </div>
  )
}
