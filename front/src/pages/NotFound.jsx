import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Compass, ArrowLeft } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import Button from '../components/ui/Button'

export default function NotFound() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-slate-50 px-6 text-center dark:bg-[#0b0c14]">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="flex h-20 w-20 items-center justify-center rounded-3xl brand-gradient text-white shadow-[var(--shadow-glow)]"
      >
        <Compass className="h-9 w-9" />
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mt-8 font-display text-6xl font-bold text-slate-900 dark:text-white"
      >
        404
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400"
      >
        This page wandered off. Let's get you back to somewhere useful.
      </motion.p>
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-8">
        <Button onClick={() => navigate(isAuthenticated ? '/app/dashboard' : '/login')}>
          <ArrowLeft className="h-4 w-4" />
          {isAuthenticated ? 'Back to dashboard' : 'Back to login'}
        </Button>
      </motion.div>
    </div>
  )
}
