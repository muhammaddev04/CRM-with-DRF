import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { activitiesApi, studentsApi, timetableApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Select, Textarea } from '../components/ui/Field'
import RequirementNotice from '../components/ui/RequirementNotice'
import { initials } from '../lib/format'
import { timetableLabel } from '../lib/constants'

function ActivityForm({ defaultValues, students, timetables, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: defaultValues?.student?.id ?? '',
      timetable: defaultValues?.timetable ?? '',
      comment: defaultValues?.comment ?? '',
    },
  })

  const missing = [students.length === 0 && 'a student', timetables.length === 0 && 'a timetable session'].filter(Boolean)

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, student_id: Number(values.student_id), timetable: Number(values.timetable) })
      )}
      className="space-y-4"
    >
      {missing.length > 0 && (
        <RequirementNotice>
          You need at least {missing.join(' and ')} before you can log activity. Add {missing.length > 1 ? 'them' : 'one'} on the{' '}
          {students.length === 0 && <strong>Students</strong>}
          {students.length === 0 && timetables.length === 0 && ' / '}
          {timetables.length === 0 && <strong>Timetable</strong>} page first.
        </RequirementNotice>
      )}
      <Select label="Student" required error={errors.student_id?.message} {...register('student_id', { required: 'Required' })}>
        <option value="">Select a student…</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.f_name} {s.l_name}
          </option>
        ))}
      </Select>
      <Select label="Session" required error={errors.timetable?.message} {...register('timetable', { required: 'Required' })}>
        <option value="">Select a timetable session…</option>
        {timetables.map((t) => (
          <option key={t.id} value={t.id}>
            {timetableLabel(t)}
          </option>
        ))}
      </Select>
      <Textarea label="Comment" required error={errors.comment?.message} {...register('comment', { required: 'Required' })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting} disabled={missing.length > 0}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Activity() {
  const { items, loading, create, update, remove } = useResource(activitiesApi)
  const { items: students } = useResource(studentsApi)
  const { items: timetables } = useResource(timetableApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const timetableById = useMemo(() => new Map(timetables.map((t) => [t.id, t])), [timetables])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((a) =>
      [`${a.student?.f_name} ${a.student?.l_name}`, a.comment].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    )
  }, [items, query])

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (a) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            {initials(a.student?.f_name, a.student?.l_name)}
          </div>
          <span className="font-medium text-slate-800 dark:text-slate-100">{a.student?.f_name} {a.student?.l_name}</span>
        </div>
      ),
    },
    { key: 'session', header: 'Session', render: (a) => timetableLabel(timetableById.get(a.timetable)) },
    { key: 'comment', header: 'Comment', render: (a) => <span className="line-clamp-1 max-w-xs text-slate-500">{a.comment}</span> },
    {
      key: 'actions',
      header: '',
      render: (a) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setModal({ mode: 'edit', activity: a })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(a)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Activity"
        subtitle={`${items.length} logged activity entr${items.length === 1 ? 'y' : 'ies'} across all sessions`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Log activity
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search activity…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No activity logged yet"
        emptyDescription="Log attendance or session notes for a student to see it here."
      />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit activity' : 'Log activity'}>
        {modal && (
          <ActivityForm
            defaultValues={modal.mode === 'edit' ? modal.activity : null}
            students={students}
            timetables={timetables}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Log activity'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.activity.id, values), { success: 'Activity updated' })
                } else {
                  await withToast(() => create(values), { success: 'Activity logged' })
                }
                setModal(null)
              } catch {
                // error already toasted
              }
            }}
          />
        )}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete activity entry?"
        description={deleteTarget ? `This entry for ${deleteTarget.student?.f_name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Activity entry deleted' })}
      />
    </div>
  )
}
