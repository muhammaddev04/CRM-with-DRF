import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, LogIn, Sparkles, ShieldCheck, Zap, BarChart3 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import { extractErrorMessage } from '../api/client'
import { Input } from '../components/ui/Field'
import Button from '../components/ui/Button'

const highlights = [
  { icon: ShieldCheck, text: 'Role-aware access for admins, mentors and students' },
  { icon: Zap, text: 'Real-time CRUD across your entire academy dataset' },
  { icon: BarChart3, text: 'Live analytics built straight from your data' },
]

export default function Login() {
  const { isAuthenticated, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [showPassword, setShowPassword] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm()

  if (isAuthenticated) {
    return <Navigate to={location.state?.from?.pathname ?? '/app/dashboard'} replace />
  }

  const onSubmit = async ({ username, password }) => {
    try {
      await login(username, password)
      toast.success('Welcome back!')
      navigate(location.state?.from?.pathname ?? '/app/dashboard', { replace: true })
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Invalid username or password'))
    }
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between brand-gradient p-12 text-white">
        <div className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle_at_20%_20%,white,transparent_35%),radial-gradient(circle_at_80%_70%,white,transparent_30%)]" />
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="font-display text-xl font-bold">Nova CRM</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative z-10 max-w-md"
        >
          <h1 className="font-display text-4xl font-bold leading-tight">Run your academy like a modern SaaS.</h1>
          <p className="mt-4 text-white/80">
            Students, mentors, courses, groups, timetables and grades — one clean workspace for your whole team.
          </p>
          <div className="mt-10 space-y-4">
            {highlights.map((h, i) => (
              <motion.div
                key={h.text}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur">
                  <h.icon className="h-4.5 w-4.5" />
                </div>
                <p className="text-sm text-white/90">{h.text}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <p className="relative z-10 text-xs text-white/60">© {new Date().getFullYear()} Nova CRM. All rights reserved.</p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center bg-slate-50 p-6 dark:bg-[#0b0c14] sm:p-10">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-sm"
        >
          <div className="mb-8 flex items-center gap-2.5 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl brand-gradient text-white shadow-[var(--shadow-glow)]">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="font-display text-xl font-bold text-slate-900 dark:text-white">Nova CRM</span>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h2>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">Use the account credentials issued by your administrator.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <Input
              label="Username"
              placeholder="jane.doe"
              autoComplete="username"
              error={errors.username?.message}
              {...register('username', { required: 'Username is required' })}
            />
            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                autoComplete="current-password"
                className="pr-11"
                error={errors.password?.message}
                {...register('password', { required: 'Password is required' })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full justify-center" loading={isSubmitting}>
              <LogIn className="h-4 w-4" />
              Sign in
            </Button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
