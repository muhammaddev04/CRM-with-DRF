import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Moon, Sun, Monitor, ShieldCheck, Copy, Check } from 'lucide-react'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { registerAccount } from '../api/auth'
import { extractErrorMessage } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { Input, Select } from '../components/ui/Field'

function AppearanceCard() {
  const { theme, setTheme } = useTheme()
  const options = [
    { key: 'light', label: 'Light', icon: Sun },
    { key: 'dark', label: 'Dark', icon: Moon },
  ]

  return (
    <Card>
      <h3 className="font-semibold text-slate-800 dark:text-slate-100">Appearance</h3>
      <p className="mt-1 text-sm text-slate-400">Choose how Nova CRM looks on this device.</p>
      <div className="mt-4 grid grid-cols-2 gap-3 sm:w-80">
        {options.map((opt) => (
          <button
            key={opt.key}
            onClick={() => setTheme(opt.key)}
            className={clsx(
              'flex flex-col items-center gap-2 rounded-xl border p-4 transition-colors',
              theme === opt.key
                ? 'border-brand-400 bg-brand-50 text-brand-700 dark:border-brand-500/50 dark:bg-brand-500/10 dark:text-brand-300'
                : 'border-slate-200 text-slate-500 hover:border-slate-300 dark:border-white/10 dark:text-slate-400'
            )}
          >
            <opt.icon className="h-5 w-5" />
            <span className="text-sm font-medium">{opt.label}</span>
          </button>
        ))}
      </div>
    </Card>
  )
}

function CreateAccountCard() {
  const [created, setCreated] = useState(null)
  const [copied, setCopied] = useState(false)
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues: { username: '', password: '', role: 'student' } })

  const onSubmit = async (values) => {
    try {
      const data = await registerAccount(values)
      setCreated(data)
      toast.success(`Account "${data.username}" created`)
      reset({ username: '', password: '', role: 'student' })
    } catch (err) {
      toast.error(extractErrorMessage(err, 'Could not create account'))
    }
  }

  const copyId = () => {
    navigator.clipboard.writeText(String(created.id))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card>
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4.5 w-4.5 text-brand-500" />
        <h3 className="font-semibold text-slate-800 dark:text-slate-100">Create account</h3>
      </div>
      <p className="mt-1 text-sm text-slate-400">
        Admin-only. Creates a login for the backend's <code className="rounded bg-slate-100 px-1 py-0.5 text-xs dark:bg-white/10">/auth/register/</code> endpoint —
        use the returned ID to link a Student or Mentor profile.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-4 max-w-sm space-y-4">
        <Input label="Username" required error={errors.username?.message} {...register('username', { required: 'Required' })} />
        <Input label="Password" type="password" required error={errors.password?.message} {...register('password', { required: 'Required' })} />
        <Select label="Role" {...register('role')}>
          <option value="student">Student</option>
          <option value="mentor">Mentor</option>
          <option value="admin">Admin</option>
        </Select>
        <Button type="submit" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      {created && (
        <div className="mt-5 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-500/20 dark:bg-emerald-500/10">
          <div className="text-sm">
            <p className="font-medium text-emerald-700 dark:text-emerald-400">
              Account #{created.id} — {created.username}
            </p>
            <p className="text-xs text-emerald-600/80 dark:text-emerald-400/70">Copy this ID into the profile's "Linked account ID" field.</p>
          </div>
          <button onClick={copyId} className="rounded-lg p-2 text-emerald-600 hover:bg-emerald-100 dark:text-emerald-400 dark:hover:bg-emerald-500/10">
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </button>
        </div>
      )}
    </Card>
  )
}

export default function Settings() {
  const { kind, loading } = useCurrentProfile()

  return (
    <div>
      <PageHeader title="Settings" subtitle="Appearance preferences and account administration." />
      <div className="space-y-6">
        <AppearanceCard />
        {!loading && kind === 'admin' && <CreateAccountCard />}
        {!loading && kind !== 'admin' && (
          <Card>
            <div className="flex items-center gap-2 text-slate-400">
              <Monitor className="h-4 w-4" />
              <p className="text-sm">Account administration is only available to admin users.</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  )
}
