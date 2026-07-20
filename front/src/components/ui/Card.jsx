import clsx from 'clsx'
import { motion } from 'framer-motion'

export default function Card({ className, children, hover = false, glass = false, ...props }) {
  const Comp = motion.div
  return (
    <Comp
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={clsx(
        'rounded-2xl p-5',
        glass ? 'glass' : 'card-surface',
        hover && 'transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-glow)]',
        className
      )}
      {...props}
    >
      {children}
    </Comp>
  )
}
