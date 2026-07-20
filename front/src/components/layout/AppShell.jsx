import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import PageTransition from './PageTransition'

export default function AppShell() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem('nova_sidebar_collapsed') === '1')
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  const toggleCollapse = () => {
    setCollapsed((c) => {
      localStorage.setItem('nova_sidebar_collapsed', c ? '0' : '1')
      return !c
    })
  }

  return (
    <div className="flex min-h-svh bg-slate-50 dark:bg-[#0b0c14]">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />
      <div className="flex min-h-svh flex-1 flex-col">
        <Topbar onOpenMobileSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>
              <Outlet />
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
