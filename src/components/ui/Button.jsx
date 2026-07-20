import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

const variants = {
  primary:
    'brand-gradient text-white shadow-[var(--shadow-glow)] hover:brightness-110 active:brightness-95',
  secondary:
    'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 dark:bg-white/5 dark:text-slate-200 dark:border-white/10 dark:hover:bg-white/10',
  ghost:
    'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10',
  danger:
    'bg-rose-500 text-white hover:bg-rose-600 shadow-[0_8px_24px_-8px_rgba(244,63,94,0.5)]',
  outline:
    'border border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-white/15 dark:text-slate-200 dark:hover:bg-white/5',
}

const sizes = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-base gap-2',
  icon: 'h-10 w-10 justify-center',
}

const Button = forwardRef(function Button(
  { className, variant = 'primary', size = 'md', loading = false, disabled, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center rounded-xl font-medium transition-all duration-150 focus-ring disabled:opacity-50 disabled:cursor-not-allowed select-none',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
})

export default Button
