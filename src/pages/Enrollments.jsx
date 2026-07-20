import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'
import { studentEnrollmentsApi, studentsApi, groupsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import { Select } from '../components/ui/Field'
import { formatDateTime, capitalize } from '../lib/format'

const statusTone = { ACTIVE: 'success', FINISHED: 'info', 'NO ACTIVE': 'neutral' }

function EnrollmentForm({ defaultValues, students, groups, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: defaultValues?.student?.id ?? '',
      group_id: defaultValues?.group?.id ?? '',
      status: defaultValues?.status ?? 'ACTIVE',
    },
  })

  return (
    <form onSubmit={handleSubmit((values) => onSubmit({ ...values, student_id: Number(values.student_id), group_id: Number(values.group_id) }))} className="space-y-4">
      <Select label="Student" required error={errors.student_id?.message} {...register('student_id', { required: 'Required' })}>
        <option value="">Select a student…</option>
        {students.map((s) => (
          <option key={s.id} value={s.id}>
            {s.f_name} {s.l_name}
          </option>
        ))}
      </Select>
      <Select label="Group" required error={errors.group_id?.message} {...register('group_id', { required: 'Required' })}>
        <option value="">Select a group…</option>
        {groups.map((g) => (
          <option key={g.id} value={g.id}>
            {g.name}
          </option>
        ))}
      </Select>
      <Select label="Status" {...register('status')}>
        <option value="ACTIVE">Active</option>
        <option value="FINISHED">Finished</option>
        <option value="NO ACTIVE">No active</option>
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Enrollments() {
  const { items, loading, create, update, remove } = useResource(studentEnrollmentsApi)
  const { items: students } = useResource(studentsApi)
  const { items: groups } = useResource(groupsApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((e) =>
      [`${e.student?.f_name} ${e.student?.l_name}`, e.group?.name].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    )
  }, [items, query])

  const columns = [
    {
      key: 'student',
      header: 'Student',
      render: (e) => <span className="font-medium text-slate-800 dark:text-slate-100">{e.student?.f_name} {e.student?.l_name}</span>,
    },
    { key: 'group', header: 'Group', render: (e) => e.group?.name },
    { key: 'course', header: 'Course', render: (e) => e.group?.course?.name },
    { key: 'status', header: 'Status', render: (e) => <Badge tone={statusTone[e.status] ?? 'neutral'}>{capitalize(e.status)}</Badge> },
    { key: 'cr_at', header: 'Enrolled', render: (e) => formatDateTime(e.cr_at) },
    {
      key: 'actions',
      header: '',
      render: (e) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setModal({ mode: 'edit', enrollment: e })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(e)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Enrollments"
        subtitle={`${items.length} student enrollment${items.length === 1 ? '' : 's'} across all groups`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })} disabled={students.length === 0 || groups.length === 0}>
            <Plus className="h-4 w-4" /> New enrollment
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search enrollments…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No enrollments yet"
        emptyDescription="Enroll a student into a group to see it here."
      />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit enrollment' : 'New enrollment'}>
        {modal && (
          <EnrollmentForm
            defaultValues={modal.mode === 'edit' ? modal.enrollment : null}
            students={students}
            groups={groups}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create enrollment'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.enrollment.id, values), { success: 'Enrollment updated' })
                } else {
                  await withToast(() => create(values), { success: 'Enrollment created' })
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
        title="Delete enrollment?"
        description={deleteTarget ? `${deleteTarget.student?.f_name} will be removed from ${deleteTarget.group?.name}.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Enrollment deleted' })}
      />
    </div>
  )
}
