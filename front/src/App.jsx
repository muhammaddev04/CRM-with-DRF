import { Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AppShell from './components/layout/AppShell'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Students from './pages/Students'
import StudentDetail from './pages/StudentDetail'
import Mentors from './pages/Mentors'
import Courses from './pages/Courses'
import Groups from './pages/Groups'
import Enrollments from './pages/Enrollments'
import Timetable from './pages/Timetable'
import Activity from './pages/Activity'
import Grades from './pages/Grades'
import Reports from './pages/Reports'
import Settings from './pages/Settings'
import Profile from './pages/Profile'
import NotFound from './pages/NotFound'

function RootRedirect() {
  const { isAuthenticated } = useAuth()
  return <Navigate to={isAuthenticated ? '/app/dashboard' : '/login'} replace />
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/app" element={<AppShell />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="mentors" element={<Mentors />} />
          <Route path="courses" element={<Courses />} />
          <Route path="groups" element={<Groups />} />
          <Route path="enrollments" element={<Enrollments />} />
          <Route path="timetable" element={<Timetable />} />
          <Route path="activity" element={<Activity />} />
          <Route path="grades" element={<Grades />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            className: '!rounded-xl !text-sm',
            style: { background: 'var(--toast-bg, #fff)' },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  )
}
