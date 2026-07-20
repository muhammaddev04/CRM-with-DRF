import { Inbox } from 'lucide-react'

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{title}</p>
        {description && <p className="mt-1 max-w-xs text-sm text-slate-400">{description}</p>}
      </div>
      {action}
    </div>
  )
}
