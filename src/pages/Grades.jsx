import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, Award, GraduationCap, ClipboardCheck } from 'lucide-react'
import clsx from 'clsx'
import { gradesApi, gradeExamsApi, studentsApi, groupsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import { Input, Select } from '../components/ui/Field'
import { formatDateTime } from '../lib/format'

function gradeTone(value) {
  const g = Number(value)
  if (g >= 85) return 'success'
  if (g >= 60) return 'warning'
  return 'danger'
}

function GradeForm({ defaultValues, students, groups, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      student_id: defaultValues?.student?.id ?? '',
      group_id: defaultValues?.group?.id ?? '',
      grade: defaultValues?.grade ?? '',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, student_id: Number(values.student_id), group_id: Number(values.group_id), grade: Number(values.grade) })
      )}
      className="space-y-4"
    >
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
      <Input label="Grade" type="number" min="0" max="100" required error={errors.grade?.message} {...register('grade', { required: 'Required' })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

const TABS = [
  { key: 'grades', label: 'Coursework grades', icon: Award, api: 'grades' },
  { key: 'exams', label: 'Exam grades', icon: ClipboardCheck, api: 'exams' },
]

export default function Grades() {
  const [tab, setTab] = useState('grades')
  const gradesRes = useResource(gradesApi)
  const examsRes = useResource(gradeExamsApi)
  const { items: students } = useResource(studentsApi)
  const { items: groups } = useResource(groupsApi)

  const active = tab === 'grades' ? gradesRes : examsRes
  const { items, loading, create, update, remove } = active

  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((g) => [`${g.student?.f_name} ${g.student?.l_name}`, g.group?.name].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
  }, [items, query])

  const columns = [
    { key: 'student', header: 'Student', render: (g) => <span className="font-medium text-slate-800 dark:text-slate-100">{g.student?.f_name} {g.student?.l_name}</span> },
    { key: 'group', header: 'Group', render: (g) => g.group?.name },
    { key: 'grade', header: 'Score', render: (g) => <Badge tone={gradeTone(g.grade)}>{g.grade} / 100</Badge> },
    { key: 'cr_at', header: 'Recorded', render: (g) => formatDateTime(g.cr_at) },
    {
      key: 'actions',
      header: '',
      render: (g) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setModal({ mode: 'edit', grade: g })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(g)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Grades"
        subtitle="Coursework and exam scores across every group"
        actions={
          <Button onClick={() => setModal({ mode: 'create' })} disabled={students.length === 0 || groups.length === 0}>
            <Plus className="h-4 w-4" /> Record grade
          </Button>
        }
      />

      <div className="mb-4 inline-flex rounded-xl border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-white/5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={clsx(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
              tab === t.key ? 'bg-brand-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            )}
          >
            <t.icon className="h-4 w-4" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-xs">
        <GraduationCap className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by student or group…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyTitle="No grades recorded" emptyDescription="Record a grade to see it here." />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit grade' : 'Record grade'}>
        {modal && (
          <GradeForm
            defaultValues={modal.mode === 'edit' ? modal.grade : null}
            students={students}
            groups={groups}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Save grade'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.grade.id, values), { success: 'Grade updated' })
                } else {
                  await withToast(() => create(values), { success: 'Grade recorded' })
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
        title="Delete grade?"
        description={deleteTarget ? `This record for ${deleteTarget.student?.f_name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Grade deleted' })}
      />
    </div>
  )
}
