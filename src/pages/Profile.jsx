import { Mail, Phone, MapPin, Cake, BadgeCheck, KeyRound, Info } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useCurrentProfile } from '../hooks/useCurrentProfile'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { formatDate, initials, capitalize } from '../lib/format'

export default function Profile() {
  const { tokenPayload } = useAuth()
  const { loading, kind, record } = useCurrentProfile()

  const displayName = record ? `${record.f_name} ${record.l_name}` : 'Admin account'

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account, as resolved from the linked Student/Mentor record." />

      {loading ? (
        <Spinner label="Resolving your profile…" />
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl brand-gradient text-lg font-bold text-white shadow-[var(--shadow-glow)]">
                {initials(record?.f_name ?? 'A', record?.l_name ?? 'D')}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{displayName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge tone="brand">{capitalize(kind)}</Badge>
                  {record?.level && <Badge tone="info">{capitalize(record.level)}</Badge>}
                </div>
              </div>
            </div>

            {record ? (
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                  <Mail className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{record.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                  <Phone className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Phone</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{record.phone}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                  <Cake className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Birthdate</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{formatDate(record.birthdate)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="text-sm text-slate-700 dark:text-slate-200">{record.adress}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-6 flex items-start gap-2 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                No Student or Mentor profile is linked to this account — it's treated as an admin/staff login.
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-400">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Profile editing isn't available yet — the backend doesn't expose a "update my own profile" endpoint.
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-2">
              <KeyRound className="h-4.5 w-4.5 text-brand-500" />
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Session</h3>
            </div>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Account ID</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">#{tokenPayload?.user_id ?? '—'}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Token expires</dt>
                <dd className="font-medium text-slate-700 dark:text-slate-200">
                  {tokenPayload?.exp ? new Date(tokenPayload.exp * 1000).toLocaleTimeString() : '—'}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-400">Resolved role</dt>
                <dd className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                  {capitalize(kind)}
                </dd>
              </div>
            </dl>
          </Card>
        </div>
      )}
    </div>
  )
}
