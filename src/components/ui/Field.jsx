import { forwardRef } from 'react'
import clsx from 'clsx'

const fieldBase =
  'w-full rounded-xl border bg-white px-3.5 h-10 text-sm text-slate-800 placeholder:text-slate-400 transition-colors focus-ring border-slate-200 hover:border-slate-300 dark:bg-white/5 dark:text-slate-100 dark:border-white/10 dark:hover:border-white/20 dark:placeholder:text-slate-500'

function FieldWrapper({ label, error, hint, required, children, className }) {
  return (
    <label className={clsx('block', className)}>
      {label && (
        <span className="mb-1.5 flex items-center gap-1 text-xs font-medium text-slate-600 dark:text-slate-300">
          {label}
          {required && <span className="text-rose-500">*</span>}
        </span>
      )}
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-slate-400">{hint}</span>}
      {error && <span className="mt-1 block text-xs font-medium text-rose-500">{error}</span>}
    </label>
  )
}

export const Input = forwardRef(function Input({ label, error, hint, required, className, ...props }, ref) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className}>
      <input
        ref={ref}
        className={clsx(fieldBase, error && 'border-rose-400 focus-visible:ring-rose-400')}
        {...props}
      />
    </FieldWrapper>
  )
})

export const Textarea = forwardRef(function Textarea({ label, error, hint, required, className, rows = 3, ...props }, ref) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className}>
      <textarea
        ref={ref}
        rows={rows}
        className={clsx(fieldBase, 'h-auto py-2.5 resize-none', error && 'border-rose-400 focus-visible:ring-rose-400')}
        {...props}
      />
    </FieldWrapper>
  )
})

export const Select = forwardRef(function Select({ label, error, hint, required, className, children, ...props }, ref) {
  return (
    <FieldWrapper label={label} error={error} hint={hint} required={required} className={className}>
      <select
        ref={ref}
        className={clsx(fieldBase, 'appearance-none bg-[url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%2394a3b8" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>\')] bg-no-repeat bg-[right_0.75rem_center] pr-9', error && 'border-rose-400 focus-visible:ring-rose-400')}
        {...props}
      >
        {children}
      </select>
    </FieldWrapper>
  )
})
