import { Loader2 } from 'lucide-react'
import clsx from 'clsx'

export default function Spinner({ className, label }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 text-slate-400">
      <Loader2 className={clsx('h-6 w-6 animate-spin text-brand-500', className)} />
      {label && <p className="text-sm">{label}</p>}
    </div>
  )
}
