import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, Search, Moon, Sun, ChevronDown, User, Settings as SettingsIcon, LogOut } from 'lucide-react'
import clsx from 'clsx'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useCurrentProfile } from '../../hooks/useCurrentProfile'
import { navItems } from './navItems'
import { capitalize, initials } from '../../lib/format'

export default function Topbar({ onOpenMobileSidebar }) {
  const { theme, toggleTheme } = useTheme()
  const { logout } = useAuth()
  const { kind, record } = useCurrentProfile()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  const matches = query.trim()
    ? navItems.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
    : []

  const displayName = record ? `${record.f_name} ${record.l_name}` : kind === 'admin' ? 'Admin' : 'Account'

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-100 bg-white/70 px-4 backdrop-blur-xl sm:px-6 dark:border-white/10 dark:bg-[#0b0c14]/70">
      <button
        onClick={onOpenMobileSidebar}
        className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden dark:text-slate-400 dark:hover:bg-white/10"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="relative hidden max-w-xs flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Jump to a page…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
        <AnimatePresence>
          {matches.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="card-surface absolute left-0 top-12 w-64 overflow-hidden rounded-xl p-1.5"
            >
              {matches.map((item) => (
                <button
                  key={item.to}
                  onClick={() => {
                    navigate(item.to)
                    setQuery('')
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <item.icon className="h-4 w-4 text-slate-400" />
                  {item.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-white/10"
          aria-label="Toggle theme"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={theme}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {theme === 'dark' ? <Sun className="h-[18px] w-[18px]" /> : <Moon className="h-[18px] w-[18px]" />}
            </motion.span>
          </AnimatePresence>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="flex items-center gap-2 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-xs font-bold text-white">
              {initials(record?.f_name ?? displayName, record?.l_name ?? '')}
            </div>
            <span className="hidden text-sm font-medium text-slate-700 sm:block dark:text-slate-200">{displayName}</span>
            <ChevronDown className={clsx('h-4 w-4 text-slate-400 transition-transform', menuOpen && 'rotate-180')} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="card-surface absolute right-0 top-12 w-56 overflow-hidden rounded-xl p-1.5"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{displayName}</p>
                  <p className="text-xs text-slate-400">{capitalize(kind)}</p>
                </div>
                <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                <button
                  onClick={() => {
                    navigate('/app/profile')
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <User className="h-4 w-4 text-slate-400" /> Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/app/settings')
                    setMenuOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10"
                >
                  <SettingsIcon className="h-4 w-4 text-slate-400" /> Settings
                </button>
                <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-500/10"
                >
                  <LogOut className="h-4 w-4" /> Log out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  )
}
