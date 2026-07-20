import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, Eye, CalendarDays, MessageSquarePlus, X as XIcon } from 'lucide-react'
import { timetableApi, groupsApi, activitiesApi, studentsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { Input, Select, Textarea } from '../components/ui/Field'
import { formatDate } from '../lib/format'

const WEEKDAYS = [
  ['DUSHANBE', 'Dushanbe (Mon)'],
  ['SESHANBE', 'Seshanbe (Tue)'],
  ['CHORSHANBE', 'Chorshanbe (Wed)'],
  ['PANJSHANBE', 'Panjshanbe (Thu)'],
  ['JUMA', 'Juma (Fri)'],
  ['SHANBE', 'Shanbe (Sat)'],
  ['YAKSHANBE', 'Yakshanbe (Sun)'],
]

function TimetableForm({ defaultValues, groups, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...defaultValues,
      group_id: defaultValues?.group?.id ?? '',
      type: defaultValues?.type ?? 'PRACTICE',
      weekday: defaultValues?.weekday ?? 'DUSHANBE',
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, group_id: Number(values.group_id) }))} className="space-y-4">
      <Select label="Group" required error={errors.group_id?.message} {...register('group_id', { required: 'Required' })}>
        <option value="">Select a group…</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start date" type="date" required error={errors.startdate?.message} {...register('startdate', { required: 'Required' })} />
        <Input label="End date" type="date" required error={errors.enddate?.message} {...register('enddate', { required: 'Required' })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Select label="Weekday" required {...register('weekday', { required: 'Required' })}>
          {WEEKDAYS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
        <Select label="Type" required {...register('type', { required: 'Required' })}>
          <option value="PRACTICE">Practice</option>
          <option value="EXAM">Exam</option>
        </Select>
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function ActivityLog({ timetableEntry, students }) {
  const { items, loading, create, remove } = useResource(activitiesApi)
  const [studentId, setStudentId] = useState('')
  const [comment, setComment] = useState('')

  const entries = items.filter((a) => a.timetable === timetableEntry.id)

  const submit = async (e) => {
    e.preventDefault()
    if (!studentId || !comment.trim()) return
    try {
      await withToast(() => create({ student_id: Number(studentId), timetable: timetableEntry.id, comment }), {
        success: 'Activity logged',
      })
      setStudentId('')
      setComment('')
    } catch {
      // error already toasted
    }
  }

  return (
    <div>
      {loading ? (
        <Spinner />
      ) : entries.length === 0 ? (
        <p className="text-sm text-slate-400">No activity logged for this session yet.</p>
      ) : (
        <ul className="max-h-56 space-y-2 overflow-y-auto">
          {entries.map((a) => (
            <li key={a.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-100 px-3 py-2.5 dark:border-white/10">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{a.student?.f_name} {a.student?.l_name}</p>
                <p className="text-xs text-slate-400">{a.comment}</p>
              </div>
              <button
                onClick={() => withToast(() => remove(a.id), { success: 'Entry removed' }).catch(() => {})}
                className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
              >
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-4 space-y-2.5 border-t border-slate-100 pt-4 dark:border-white/10">
        <Select value={studentId} onChange={(e) => setStudentId(e.target.value)}>
          <option value="">Select a student…</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.f_name} {s.l_name}
            </option>
          ))}
        </Select>
        <Textarea rows={2} placeholder="Attendance note or comment…" value={comment} onChange={(e) => setComment(e.target.value)} />
        <Button type="submit" variant="secondary" size="sm" className="w-full">
          <MessageSquarePlus className="h-4 w-4" /> Log activity
        </Button>
      </form>
    </div>
  )
}

export default function Timetable() {
  const { items, loading, create, update, remove } = useResource(timetableApi)
  const { items: groups } = useResource(groupsApi)
  const { items: students } = useResource(studentsApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [detailEntry, setDetailEntry] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((t) => t.group?.name?.toLowerCase().includes(q))
  }, [items, query])

  const columns = [
    {
      key: 'group',
      header: 'Group',
      render: (t) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300">
            <CalendarDays className="h-4.5 w-4.5" />
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-100">{t.group?.name}</span>
        </div>
      ),
    },
    { key: 'weekday', header: 'Weekday', render: (t) => WEEKDAYS.find(([v]) => v === t.weekday)?.[1] ?? t.weekday },
    { key: 'type', header: 'Type', render: (t) => <Badge tone={t.type === 'EXAM' ? 'danger' : 'brand'}>{t.type === 'EXAM' ? 'Exam' : 'Practice'}</Badge> },
    { key: 'dates', header: 'Window', render: (t) => `${formatDate(t.startdate)} – ${formatDate(t.enddate)}` },
    {
      key: 'actions',
      header: '',
      render: (t) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setDetailEntry(t)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => setModal({ mode: 'edit', entry: t })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(t)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle={`${items.length} scheduled session${items.length === 1 ? '' : 's'}`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })} disabled={groups.length === 0}>
            <Plus className="h-4 w-4" /> Add session
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by group…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyTitle="No sessions scheduled" emptyDescription="Add a timetable entry to start scheduling." />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit session' : 'Add session'}>
        {modal && (
          <TimetableForm
            defaultValues={modal.mode === 'edit' ? modal.entry : { startdate: '', enddate: '' }}
            groups={groups}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create session'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.entry.id, values), { success: 'Session updated' })
                } else {
                  await withToast(() => create(values), { success: 'Session created' })
                }
                setModal(null)
              } catch {
                // error already toasted
              }
            }}
          />
        )}
      </Modal>

      <Modal open={!!detailEntry} onClose={() => setDetailEntry(null)} title={detailEntry?.group?.name} description="Session activity log">
        {detailEntry && <ActivityLog timetableEntry={detailEntry} students={students} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete session?"
        description={deleteTarget ? `This ${deleteTarget.type?.toLowerCase()} session will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Session deleted' })}
      />
    </div>
  )
}
