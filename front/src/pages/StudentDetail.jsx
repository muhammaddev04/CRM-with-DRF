import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Cake,
  Hash,
  Layers,
  BookOpen,
  UserCog,
  ClipboardList,
  Award,
  ClipboardCheck,
  NotebookPen,
  History,
  TrendingUp,
  Target,
  UserCircle,
  Info,
  GraduationCap,
} from 'lucide-react'
import { studentDetailApi, timetableApi } from '../api/resources'
import { useResource } from '../hooks/useResource'
import { extractErrorMessage } from '../api/client'
import { useTheme } from '../context/ThemeContext'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import StatCard from '../components/ui/StatCard'
import Skeleton from '../components/ui/Skeleton'
import EmptyState from '../components/ui/EmptyState'
import { formatDate, formatDateTime, initials, capitalize, timeAgo } from '../lib/format'
import { timetableLabel } from '../lib/constants'
import { chartTheme, gradeBucketColor } from '../lib/chartTheme'

const statusTone = { ACTIVE: 'success', FINISHED: 'info', 'NO ACTIVE': 'neutral' }
const toneColors = {
  brand: 'bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300',
  sky: 'bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300',
  amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
  accent: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 px-4 py-3 dark:border-white/10">
      <Icon className="h-4 w-4 shrink-0 text-slate-400" />
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="truncate text-sm text-slate-700 dark:text-slate-200">{value ?? 'Not available'}</p>
      </div>
    </div>
  )
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
  return (
    <Card>
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
          <Icon className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-100">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>
      </div>
      {children}
    </Card>
  )
}

export default function StudentDetail() {
  const { id } = useParams()
  const studentId = Number(id)
  const navigate = useNavigate()

  const [detail, setDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    studentDetailApi
      .get(studentId)
      .then((data) => {
        if (!cancelled) setDetail(data)
      })
      .catch((err) => {
        if (!cancelled) setError(extractErrorMessage(err, 'Could not load this student'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [studentId])

  // Only extra data the new endpoint doesn't nest: activities carry a raw
  // `timetable` id (not an object), so we resolve it against the timetable
  // list purely to render a readable session label.
  const { items: timetables } = useResource(timetableApi)
  const timetableById = useMemo(() => new Map(timetables.map((t) => [t.id, t])), [timetables])

  const enrollments = useMemo(
    () => (detail?.enrollments ?? []).slice().sort((a, b) => new Date(b.cr_at) - new Date(a.cr_at)),
    [detail]
  )
  const lessonGrades = useMemo(
    () => (detail?.lesson_grades ?? []).slice().sort((a, b) => new Date(b.cr_at) - new Date(a.cr_at)),
    [detail]
  )
  const examGrades = useMemo(
    () => (detail?.exam_grades ?? []).slice().sort((a, b) => new Date(b.cr_at) - new Date(a.cr_at)),
    [detail]
  )
  const activities = useMemo(
    () =>
      (detail?.activities ?? [])
        .map((a) => ({ ...a, session: timetableById.get(a.timetable) }))
        .sort((a, b) => new Date(b.session?.startdate ?? 0) - new Date(a.session?.startdate ?? 0)),
    [detail, timetableById]
  )

  const { theme } = useTheme()
  const t = chartTheme[theme]

  const activeGroup = detail?.active_group ?? null
  const activeCourse = activeGroup?.course ?? null
  const activeMentor = activeGroup?.mentor ?? null

  // Frontend-only derived stats — computed from the arrays the endpoint already
  // returns, not fetched or invented.
  const lessonDistribution = useMemo(() => {
    const buckets = [0, 1, 2, 3, 4, 5].map((value) => ({ value: String(value), count: 0 }))
    lessonGrades.forEach((g) => {
      const bucket = buckets.find((b) => b.value === String(g.grade))
      if (bucket) bucket.count += 1
    })
    return buckets
  }, [lessonGrades])

  const examDistribution = useMemo(() => {
    const buckets = { '0-59': 0, '60-69': 0, '70-84': 0, '85-100': 0 }
    examGrades.forEach((g) => {
      const n = Number(g.grade)
      if (n < 60) buckets['0-59']++
      else if (n < 70) buckets['60-69']++
      else if (n < 85) buckets['70-84']++
      else buckets['85-100']++
    })
    return Object.entries(buckets).map(([bucket, count]) => ({ bucket, count }))
  }, [examGrades])

  const lessonPassRate = lessonGrades.length
    ? Math.round((lessonGrades.filter((g) => Number(g.grade) >= 3).length / lessonGrades.length) * 100)
    : null
  const examPassRate = examGrades.length
    ? Math.round((examGrades.filter((g) => Number(g.grade) >= 60).length / examGrades.length) * 100)
    : null

  const timeline = useMemo(() => {
    if (!detail) return []
    const events = []
    enrollments.forEach((e) =>
      events.push({ date: e.cr_at, icon: ClipboardList, tone: 'brand', title: `Enrolled in ${e.group?.name ?? 'a group'}`, detail: e.group?.course?.name })
    )
    lessonGrades.forEach((g) =>
      events.push({ date: g.cr_at, icon: Award, tone: 'sky', title: `Lesson grade recorded: ${g.grade} / 5`, detail: g.group?.name })
    )
    examGrades.forEach((g) =>
      events.push({ date: g.cr_at, icon: ClipboardCheck, tone: 'amber', title: `Exam grade recorded: ${g.grade} / 100`, detail: g.group?.name })
    )
    activities
      .filter((a) => a.session?.startdate)
      .forEach((a) =>
        events.push({ date: a.session.startdate, icon: NotebookPen, tone: 'accent', title: `Activity logged — ${timetableLabel(a.session)}`, detail: a.comment })
      )
    return events.filter((e) => e.date).sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [detail, enrollments, lessonGrades, examGrades, activities])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 11 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  if (error || !detail) {
    return (
      <Card>
        <EmptyState
          icon={Info}
          title="Student not found"
          description={error ?? "This student doesn't exist or may have been removed."}
          action={
            <Button variant="secondary" onClick={() => navigate('/app/students')}>
              <ArrowLeft className="h-4 w-4" /> Back to Students
            </Button>
          }
        />
      </Card>
    )
  }

  const hasLessonGrades = detail.total_lesson_grades > 0
  const hasExamGrades = detail.total_exam_grades > 0

  return (
    <div>
      <button
        onClick={() => navigate('/app/students')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-4 w-4" /> Back to Students
      </button>

      {/* Statistics dashboard */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard index={0} icon={Layers} tone="brand" label="Total groups" value={detail.total_groups} />
        <StatCard index={1} icon={BookOpen} tone="accent" label="Total courses" value={detail.total_courses} />
        <StatCard index={2} icon={ClipboardList} tone="sky" label="Total activities" value={detail.total_activities} />
        <StatCard index={3} icon={Award} tone="sky" label="Total lesson grades" value={detail.total_lesson_grades} />
        <StatCard index={4} icon={TrendingUp} tone="brand" label="Avg lesson grade" value={hasLessonGrades ? `${detail.average_lesson_grade} / 5` : 'Not available'} />
        <StatCard index={5} icon={ClipboardCheck} tone="amber" label="Total exam grades" value={detail.total_exam_grades} />
        <StatCard index={6} icon={TrendingUp} tone="rose" label="Avg exam grade" value={hasExamGrades ? `${detail.average_exam_grade} / 100` : 'Not available'} />
        <StatCard index={7} icon={Award} tone="accent" label="Highest exam grade" value={detail.highest_exam_grade ?? 'Not available'} />
        <StatCard index={8} icon={Award} tone="rose" label="Lowest exam grade" value={detail.lowest_exam_grade ?? 'Not available'} />
        <StatCard index={9} icon={Target} tone="brand" label="Lesson pass rate" value={lessonPassRate != null ? `${lessonPassRate}%` : 'Not available'} />
        <StatCard index={10} icon={Target} tone="amber" label="Exam pass rate" value={examPassRate != null ? `${examPassRate}%` : 'Not available'} />
      </div>
      <p className="mb-6 -mt-4 text-xs text-slate-400">Pass rates are calculated on the frontend from the grades below (lesson ≥ 3/5, exam ≥ 60/100).</p>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Profile */}
        <Card className="xl:col-span-2">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl brand-gradient text-lg font-bold text-white shadow-[var(--shadow-glow)]">
              {initials(detail.f_name, detail.l_name)}
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                {detail.f_name} {detail.l_name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <Badge tone="brand">Student</Badge>
                {detail.user?.username && <Badge tone="neutral">@{detail.user.username}</Badge>}
              </div>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <InfoTile icon={Mail} label="Email" value={detail.email} />
            <InfoTile icon={Phone} label="Phone" value={detail.phone} />
            <InfoTile icon={Cake} label="Birthdate" value={formatDate(detail.birthdate)} />
            <InfoTile icon={MapPin} label="Address" value={detail.adress} />
            <InfoTile icon={Hash} label="Student ID" value={`#${detail.id}`} />
            <InfoTile icon={UserCircle} label="Linked user" value={detail.user ? `${detail.user.username} (#${detail.user.id})` : 'Not available'} />
          </div>
        </Card>

        {/* Active group */}
        <SectionCard icon={Layers} title="Active group" subtitle="Currently active enrollment">
          {activeGroup ? (
            <div className="space-y-3">
              <InfoTile icon={Layers} label="Group" value={activeGroup.name} />
              <InfoTile icon={BookOpen} label="Course" value={activeCourse?.name} />
              <InfoTile icon={UserCog} label="Mentor" value={activeMentor ? `${activeMentor.f_name} ${activeMentor.l_name}` : 'Not available'} />
              <InfoTile icon={GraduationCap} label="Branch" value={activeGroup.branch} />
            </div>
          ) : (
            <EmptyState icon={Layers} title="No active group" description="This student has no ACTIVE enrollment right now." />
          )}
        </SectionCard>
      </div>

      {/* Enrollment history */}
      <div className="mt-6">
        <SectionCard icon={ClipboardList} title="Enrollment history" subtitle={`${enrollments.length} enrollment${enrollments.length === 1 ? '' : 's'} on record`}>
          {enrollments.length === 0 ? (
            <EmptyState icon={ClipboardList} title="No data available" description="This student hasn't been enrolled in any group yet." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-white/10">
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Group</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Course</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Mentor</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Status</th>
                    <th className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Enrolled</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((e) => (
                    <tr key={e.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                      <td className="px-3 py-2.5 font-medium text-slate-700 dark:text-slate-200">{e.group?.name}</td>
                      <td className="px-3 py-2.5 text-slate-500">{e.group?.course?.name}</td>
                      <td className="px-3 py-2.5 text-slate-500">{e.group?.mentor ? `${e.group.mentor.f_name} ${e.group.mentor.l_name}` : 'Not available'}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={statusTone[e.status] ?? 'neutral'}>{capitalize(e.status)}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-slate-500">
                        {formatDateTime(e.cr_at)}
                        <span className="ml-1.5 text-xs text-slate-400">({timeAgo(e.cr_at)})</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>
      </div>

      {/* Lesson & exam grades */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard icon={Award} title="Lesson grades" subtitle="0–5 scale, per class session">
          {!hasLessonGrades ? (
            <EmptyState icon={Award} title="No data available" description="No lesson grades recorded yet." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={lessonDistribution} margin={{ left: -20, right: 10, top: 4 }}>
                  <CartesianGrid vertical={false} stroke={t.grid} />
                  <XAxis dataKey="value" tickLine={false} axisLine={{ stroke: t.axis }} tick={{ fill: t.inkMuted, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: t.inkMuted, fontSize: 11 }} width={24} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Bar dataKey="count" name="Entries" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {lessonDistribution.map((entry) => (
                      <Cell key={entry.value} fill={Number(entry.value) >= 5 ? t.good : Number(entry.value) >= 3 ? t.warning : t.critical} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mb-3 mt-1 flex flex-wrap gap-2 text-xs">
                <Badge tone="brand">Average {detail.average_lesson_grade} / 5</Badge>
                <Badge tone="neutral">{detail.total_lesson_grades} graded</Badge>
                {lessonPassRate != null && <Badge tone="success">{lessonPassRate}% pass rate</Badge>}
              </div>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {lessonGrades.map((g) => (
                  <li key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-white/10">
                    <span className="text-slate-600 dark:text-slate-300">{g.group?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(g.cr_at)}</span>
                      <Badge tone={Number(g.grade) >= 5 ? 'success' : Number(g.grade) >= 3 ? 'warning' : 'danger'}>{g.grade} / 5</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>

        <SectionCard icon={ClipboardCheck} title="Exam grades" subtitle="0–100 scale">
          {!hasExamGrades ? (
            <EmptyState icon={ClipboardCheck} title="No data available" description="No exam grades recorded yet." />
          ) : (
            <>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={examDistribution} margin={{ left: -20, right: 10, top: 4 }}>
                  <CartesianGrid vertical={false} stroke={t.grid} />
                  <XAxis dataKey="bucket" tickLine={false} axisLine={{ stroke: t.axis }} tick={{ fill: t.inkMuted, fontSize: 11 }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} tick={{ fill: t.inkMuted, fontSize: 11 }} width={24} />
                  <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', fontSize: 12 }} />
                  <Bar dataKey="count" name="Entries" radius={[6, 6, 0, 0]} maxBarSize={36}>
                    {examDistribution.map((entry) => (
                      <Cell key={entry.bucket} fill={gradeBucketColor(entry.bucket, theme)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="mb-3 mt-1 flex flex-wrap gap-2 text-xs">
                <Badge tone="success">Highest {detail.highest_exam_grade}</Badge>
                <Badge tone="danger">Lowest {detail.lowest_exam_grade}</Badge>
                <Badge tone="brand">Average {detail.average_exam_grade}</Badge>
                {examPassRate != null && <Badge tone="info">{examPassRate}% pass rate</Badge>}
              </div>
              <ul className="max-h-64 space-y-2 overflow-y-auto">
                {examGrades.map((g) => (
                  <li key={g.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-white/10">
                    <span className="text-slate-600 dark:text-slate-300">{g.group?.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{formatDate(g.cr_at)}</span>
                      <Badge tone={Number(g.grade) >= 85 ? 'success' : Number(g.grade) >= 60 ? 'warning' : 'danger'}>{g.grade} / 100</Badge>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </SectionCard>
      </div>

      {/* Activities */}
      <div className="mt-6">
        <SectionCard
          icon={NotebookPen}
          title="Activities"
          subtitle="Session notes logged by mentors, with related timetable information"
        >
          {activities.length === 0 ? (
            <EmptyState icon={NotebookPen} title="No data available" description="No activity has been logged for this student yet." />
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {activities.map((a) => (
                <li key={a.id} className="rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{timetableLabel(a.session)}</span>
                    <span className="shrink-0 text-xs text-slate-400">{a.session?.startdate ? formatDate(a.session.startdate) : 'Not available'}</span>
                  </div>
                  <p className="mt-1 text-sm text-slate-500">{a.comment}</p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      {/* Timeline */}
      <div className="mt-6">
        <SectionCard icon={History} title="Timeline" subtitle="Chronological history built from real enrollment, grade and activity records">
          {timeline.length === 0 ? (
            <EmptyState icon={History} title="No data available" description="Timeline events will appear as this student enrolls, gets graded, or has activity logged." />
          ) : (
            <ol className="relative space-y-5 border-l border-slate-100 pl-6 dark:border-white/10">
              {timeline.map((event, i) => (
                <li key={i} className="relative">
                  <span className={`absolute -left-[31px] flex h-6 w-6 items-center justify-center rounded-full ${toneColors[event.tone]}`}>
                    <event.icon className="h-3.5 w-3.5" />
                  </span>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{event.title}</p>
                  {event.detail && <p className="text-xs text-slate-400">{event.detail}</p>}
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDate(event.date)} · {timeAgo(event.date)}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
