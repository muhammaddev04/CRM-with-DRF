import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GraduationCap, UserCog, Layers, Wallet, ClipboardList, Award } from 'lucide-react'
import { studentsApi, mentorsApi, coursesApi, groupsApi, studentEnrollmentsApi, gradesApi, gradeExamsApi } from '../api/resources'
import { useResource } from '../hooks/useResource'
import { useTheme } from '../context/ThemeContext'
import PageHeader from '../components/ui/PageHeader'
import Card from '../components/ui/Card'
import StatCard from '../components/ui/StatCard'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import Spinner from '../components/ui/Spinner'
import EmptyState from '../components/ui/EmptyState'
import { chartTheme, gradeBucketColor } from '../lib/chartTheme'
import { formatCurrency, formatDate, initials, timeAgo } from '../lib/format'

const quickActions = [
  { label: 'Add student', to: '/app/students', icon: GraduationCap },
  { label: 'Add mentor', to: '/app/mentors', icon: UserCog },
  { label: 'New group', to: '/app/groups', icon: Layers },
  { label: 'Schedule session', to: '/app/timetable', icon: ClipboardList },
]

function monthKey(date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function monthLabel(key) {
  const [y, m] = key.split('-')
  return new Date(Number(y), Number(m) - 1, 1).toLocaleDateString(undefined, { month: 'short' })
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { theme } = useTheme()
  const t = chartTheme[theme]

  const { items: students, loading: lStudents } = useResource(studentsApi)
  const { items: mentors, loading: lMentors } = useResource(mentorsApi)
  const { items: courses, loading: lCourses } = useResource(coursesApi)
  const { items: groups, loading: lGroups } = useResource(groupsApi)
  const { items: enrollments, loading: lEnrollments } = useResource(studentEnrollmentsApi)
  const { items: grades } = useResource(gradesApi)
  const { items: examGrades } = useResource(gradeExamsApi)

  const loading = lStudents || lMentors || lCourses || lGroups || lEnrollments

  const activeGroups = groups.filter((g) => g.status).length
  const catalogValue = courses.reduce((sum, c) => sum + (Number(c.price) || 0), 0)

  const enrollmentTrend = useMemo(() => {
    const buckets = {}
    enrollments.forEach((e) => {
      if (!e.cr_at) return
      const key = monthKey(e.cr_at)
      buckets[key] = (buckets[key] ?? 0) + 1
    })
    return Object.keys(buckets)
      .sort()
      .slice(-6)
      .map((key) => ({ key, label: monthLabel(key), count: buckets[key] }))
  }, [enrollments])

  const gradeDistribution = useMemo(() => {
    const all = [...grades, ...examGrades].map((g) => Number(g.grade)).filter((n) => !Number.isNaN(n))
    const buckets = { '0-59': 0, '60-69': 0, '70-84': 0, '85-100': 0 }
    all.forEach((g) => {
      if (g < 60) buckets['0-59']++
      else if (g < 70) buckets['60-69']++
      else if (g < 85) buckets['70-84']++
      else buckets['85-100']++
    })
    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }))
  }, [grades, examGrades])

  const groupStatusData = [
    { name: 'Active', value: activeGroups, color: t.good },
    { name: 'Inactive', value: Math.max(groups.length - activeGroups, 0), color: t.neutral },
  ]

  const recentEnrollments = useMemo(
    () => [...enrollments].sort((a, b) => new Date(b.cr_at) - new Date(a.cr_at)).slice(0, 5),
    [enrollments]
  )

  const recentGroups = useMemo(
    () => [...groups].sort((a, b) => new Date(b.start_time) - new Date(a.start_time)).slice(0, 5),
    [groups]
  )

  const topStudents = useMemo(() => {
    const byStudent = new Map()
    ;[...grades, ...examGrades].forEach((g) => {
      if (!g.student) return
      const key = g.student.id
      const entry = byStudent.get(key) ?? { student: g.student, total: 0, count: 0 }
      entry.total += Number(g.grade) || 0
      entry.count += 1
      byStudent.set(key, entry)
    })
    return Array.from(byStudent.values())
      .map((e) => ({ ...e, avg: e.total / e.count }))
      .sort((a, b) => b.avg - a.avg)
      .slice(0, 5)
  }, [grades, examGrades])

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live overview of your academy — students, mentors, groups and performance."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} icon={GraduationCap} tone="brand" label="Total students" value={loading ? '—' : students.length} />
        <StatCard index={1} icon={UserCog} tone="accent" label="Total mentors" value={loading ? '—' : mentors.length} />
        <StatCard index={2} icon={Layers} tone="sky" label="Active groups" value={loading ? '—' : `${activeGroups} / ${groups.length}`} />
        <StatCard index={3} icon={Wallet} tone="amber" label="Catalog value" value={loading ? '—' : formatCurrency(catalogValue)} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-800 dark:text-slate-100">Enrollments over time</h3>
              <p className="text-xs text-slate-400">New student enrollments per month</p>
            </div>
          </div>
          {enrollmentTrend.length === 0 ? (
            <EmptyState title="No enrollment history yet" description="Enrollment trends will appear once students join groups." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={enrollmentTrend} margin={{ left: -20, right: 10, top: 10 }}>
                <defs>
                  <linearGradient id="enrollFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={t.blueFillFrom} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={t.blueFillFrom} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} stroke={t.grid} />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: t.axis }} tick={{ fill: t.inkMuted, fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: t.inkMuted, fontSize: 12 }} width={28} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }}
                  labelStyle={{ color: t.ink, fontWeight: 600 }}
                />
                <Area type="monotone" dataKey="count" name="Enrollments" stroke={t.blue} strokeWidth={2} fill="url(#enrollFill)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Groups</h3>
            <p className="text-xs text-slate-400">Active vs. inactive</p>
          </div>
          {groups.length === 0 ? (
            <EmptyState title="No groups yet" />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={groupStatusData} dataKey="value" nameKey="name" innerRadius={55} outerRadius={80} paddingAngle={3}>
                    {groupStatusData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-2 flex justify-center gap-5">
                {groupStatusData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
                    {entry.name} ({entry.value})
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Grade distribution</h3>
            <p className="text-xs text-slate-400">Coursework + exam grades, by score band</p>
          </div>
          {gradeDistribution.every((b) => b.count === 0) ? (
            <EmptyState title="No grades recorded yet" />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={gradeDistribution} margin={{ left: -20, right: 10, top: 10 }}>
                <CartesianGrid vertical={false} stroke={t.grid} />
                <XAxis dataKey="bucket" tickLine={false} axisLine={{ stroke: t.axis }} tick={{ fill: t.inkMuted, fontSize: 12 }} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: t.inkMuted, fontSize: 12 }} width={28} />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 13 }}
                />
                <Bar dataKey="count" name="Students" radius={[6, 6, 0, 0]} maxBarSize={48}>
                  {gradeDistribution.map((entry) => (
                    <Cell key={entry.bucket} fill={gradeBucketColor(entry.bucket, theme)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Quick actions</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.to)}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 text-center transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-white/10 dark:hover:border-brand-500/30 dark:hover:bg-white/5"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <a.icon className="h-4.5 w-4.5" />
                </div>
                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent enrollments</h3>
            <button onClick={() => navigate('/app/enrollments')} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </button>
          </div>
          {loading ? (
            <Spinner />
          ) : recentEnrollments.length === 0 ? (
            <EmptyState title="No activity yet" />
          ) : (
            <ul className="space-y-3">
              {recentEnrollments.map((e) => (
                <li key={e.id} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
                    {initials(e.student?.f_name, e.student?.l_name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-slate-700 dark:text-slate-200">
                      <span className="font-medium">{e.student?.f_name} {e.student?.l_name}</span> joined {e.group?.name}
                    </p>
                    <p className="text-xs text-slate-400">{timeAgo(e.cr_at)}</p>
                  </div>
                  <Badge tone={e.status === 'ACTIVE' ? 'success' : e.status === 'FINISHED' ? 'info' : 'neutral'}>{e.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Recent groups</h3>
            <button onClick={() => navigate('/app/groups')} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </button>
          </div>
          {loading ? (
            <Spinner />
          ) : recentGroups.length === 0 ? (
            <EmptyState title="No groups yet" />
          ) : (
            <ul className="space-y-3">
              {recentGroups.map((g) => (
                <li key={g.id} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700 dark:text-slate-200">{g.name}</p>
                    <p className="text-xs text-slate-400">{g.course?.name} · {formatDate(g.start_time)}</p>
                  </div>
                  <Badge tone={g.status ? 'success' : 'neutral'}>{g.status ? 'Active' : 'Inactive'}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="xl:col-span-1">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-100">Top students</h3>
            <button onClick={() => navigate('/app/grades')} className="text-xs font-medium text-brand-600 hover:underline dark:text-brand-400">
              View all
            </button>
          </div>
          {topStudents.length === 0 ? (
            <EmptyState icon={Award} title="No grades yet" />
          ) : (
            <ul className="space-y-3">
              {topStudents.map((s, i) => (
                <li key={s.student.id} className="flex items-center gap-3">
                  <span className="w-4 text-xs font-bold text-slate-400">#{i + 1}</span>
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    {initials(s.student.f_name, s.student.l_name)}
                  </div>
                  <span className="flex-1 truncate text-sm text-slate-700 dark:text-slate-200">{s.student.f_name} {s.student.l_name}</span>
                  <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{s.avg.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  )
}
