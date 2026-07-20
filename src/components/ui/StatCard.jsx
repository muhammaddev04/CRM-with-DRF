import { motion } from 'framer-motion'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import clsx from 'clsx'
import Card from './Card'

const tones = {
  brand: 'from-brand-500 to-violet-500',
  accent: 'from-accent-500 to-emerald-400',
  amber: 'from-amber-500 to-orange-400',
  sky: 'from-sky-500 to-cyan-400',
  rose: 'from-rose-500 to-pink-400',
}

export default function StatCard({ icon: Icon, label, value, trend, tone = 'brand', index = 0 }) {
  const positive = typeof trend === 'number' ? trend >= 0 : null

  return (
    <Card hover className="relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
        className="flex items-start justify-between"
      >
        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
          {trend !== undefined && trend !== null && (
            <span
              className={clsx(
                'mt-2 inline-flex items-center gap-1 text-xs font-semibold',
                positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500'
              )}
            >
              {positive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div className={clsx('flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-lg', tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </motion.div>
    </Card>
  )
}
