import clsx from 'clsx'

const tones = {
  neutral: 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300',
  brand: 'bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-300',
  success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  warning: 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400',
  danger: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400',
  info: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400',
}

export default function Badge({ tone = 'neutral', className, children, dot = false }) {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium',
        tones[tone],
        className
      )}
    >
      {dot && <span className={clsx('h-1.5 w-1.5 rounded-full', tones[tone].split(' ')[1])} style={{ backgroundColor: 'currentColor' }} />}
      {children}
    </span>
  )
}
