import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronsLeft, LogOut, Sparkles, X } from 'lucide-react'
import clsx from 'clsx'
import { navItems } from './navItems'
import { useAuth } from '../../context/AuthContext'

function NavItem({ item, collapsed, onNavigate }) {
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        clsx(
          'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'text-brand-700 dark:text-white'
            : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <motion.span
              layoutId="sidebar-active-pill"
              transition={{ type: 'spring', stiffness: 400, damping: 32 }}
              className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-white/[0.08]"
            />
          )}
          <item.icon className={clsx('relative z-10 h-[18px] w-[18px] shrink-0', isActive && 'text-brand-600 dark:text-brand-300')} />
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.15 }}
                className="relative z-10 overflow-hidden whitespace-nowrap"
              >
                {item.label}
              </motion.span>
            )}
          </AnimatePresence>
        </>
      )}
    </NavLink>
  )
}

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile }) {
  const { logout } = useAuth()

  const content = (
    <div className="flex h-full flex-col">
      <div className={clsx('flex items-center gap-2.5 px-4 py-5', collapsed && 'justify-center px-0')}>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl brand-gradient text-white shadow-[var(--shadow-glow)]">
          <Sparkles className="h-4.5 w-4.5" />
        </div>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-display text-lg font-bold text-slate-900 dark:text-white"
            >
              Nova CRM
            </motion.span>
          )}
        </AnimatePresence>
        <button onClick={onCloseMobile} className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 lg:hidden dark:hover:bg-white/10">
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {navItems.map((item) => (
          <NavItem key={item.to} item={item} collapsed={collapsed} onNavigate={onCloseMobile} />
        ))}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-white/10">
        <button
          onClick={logout}
          className={clsx(
            'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-500 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:text-slate-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-400',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="h-[18px] w-[18px] shrink-0" />
          {!collapsed && <span>Log out</span>}
        </button>
        <button
          onClick={onToggleCollapse}
          className={clsx(
            'mt-1 hidden w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-100 lg:flex dark:hover:bg-white/10',
            collapsed && 'justify-center'
          )}
        >
          <ChevronsLeft className={clsx('h-[18px] w-[18px] shrink-0 transition-transform', collapsed && 'rotate-180')} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="sticky top-0 z-30 hidden h-svh shrink-0 border-r border-slate-100 bg-white/80 backdrop-blur-xl lg:block dark:border-white/10 dark:bg-[#0e0f17]/80"
      >
        {content}
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseMobile}
              className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-100 bg-white lg:hidden dark:border-white/10 dark:bg-[#0e0f17]"
            >
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
