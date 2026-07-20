import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, Eye, Layers, UserPlus, X as XIcon } from 'lucide-react'
import { groupsApi, coursesApi, mentorsApi, mentorEnrollmentsApi, studentEnrollmentsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import Spinner from '../components/ui/Spinner'
import { Input, Textarea, Select } from '../components/ui/Field'
import { formatDate, initials } from '../lib/format'

function GroupForm({ defaultValues, courses, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      ...defaultValues,
      course_id: defaultValues?.course?.id ?? '',
      status: defaultValues?.status ? 'true' : 'false',
    },
  })

  return (
    <form
      onSubmit={handleSubmit((values) =>
        onSubmit({ ...values, course_id: Number(values.course_id), status: values.status === 'true' })
      )}
      className="space-y-4"
    >
      <Input label="Group name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
      <Textarea label="Description" required error={errors.description?.message} {...register('description', { required: 'Required' })} />
      <div className="grid grid-cols-2 gap-4">
        <Select label="Course" required error={errors.course_id?.message} {...register('course_id', { required: 'Required' })}>
          <option value="">Select a course…</option>
          {courses.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Input label="Branch" required error={errors.branch?.message} {...register('branch', { required: 'Required' })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Start date" type="date" required error={errors.start_time?.message} {...register('start_time', { required: 'Required' })} />
        <Input label="End date" type="date" required error={errors.end_time?.message} {...register('end_time', { required: 'Required' })} />
      </div>
      <Select label="Status" {...register('status')}>
        <option value="true">Active</option>
        <option value="false">Inactive</option>
      </Select>
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

function GroupDetail({ group, mentors }) {
  const { items: mentorEnrolls, loading, create, remove } = useResource(mentorEnrollmentsApi)
  const { items: studentEnrolls, loading: loadingStudents } = useResource(studentEnrollmentsApi)
  const [mentorId, setMentorId] = useState('')

  const assigned = mentorEnrolls.filter((e) => e.group?.id === group.id)
  const roster = studentEnrolls.filter((e) => e.group?.id === group.id)
  const availableMentors = mentors.filter((m) => !assigned.some((e) => e.mentor?.id === m.id))

  const assign = async () => {
    if (!mentorId) return
    try {
      await withToast(() => create({ group_id: group.id, mentor_id: Number(mentorId) }), { success: 'Mentor assigned' })
      setMentorId('')
    } catch {
      // error already toasted
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs text-slate-400">Course</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{group.course?.name}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Branch</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{group.branch}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Start</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(group.start_time)}</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">End</p>
          <p className="font-medium text-slate-700 dark:text-slate-200">{formatDate(group.end_time)}</p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Assigned mentors</p>
        {loading ? (
          <Spinner />
        ) : assigned.length === 0 ? (
          <p className="text-sm text-slate-400">No mentor assigned yet.</p>
        ) : (
          <ul className="space-y-2">
            {assigned.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 dark:border-white/10">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-[10px] font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
                    {initials(e.mentor?.f_name, e.mentor?.l_name)}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-200">{e.mentor?.f_name} {e.mentor?.l_name}</span>
                </div>
                <button
                  onClick={() => withToast(() => remove(e.id), { success: 'Mentor removed' }).catch(() => {})}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10"
                >
                  <XIcon className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-3 flex gap-2">
          <Select value={mentorId} onChange={(e) => setMentorId(e.target.value)} className="flex-1">
            <option value="">Assign a mentor…</option>
            {availableMentors.map((m) => (
              <option key={m.id} value={m.id}>
                {m.f_name} {m.l_name}
              </option>
            ))}
          </Select>
          <Button variant="secondary" onClick={assign} disabled={!mentorId}>
            <UserPlus className="h-4 w-4" /> Assign
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Student roster ({roster.length})
        </p>
        {loadingStudents ? (
          <Spinner />
        ) : roster.length === 0 ? (
          <p className="text-sm text-slate-400">No students enrolled yet — manage this from the Enrollments page.</p>
        ) : (
          <ul className="max-h-48 space-y-2 overflow-y-auto">
            {roster.map((e) => (
              <li key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2 text-sm dark:border-white/10">
                <span className="text-slate-700 dark:text-slate-200">{e.student?.f_name} {e.student?.l_name}</span>
                <Badge tone={e.status === 'ACTIVE' ? 'success' : e.status === 'FINISHED' ? 'info' : 'neutral'}>{e.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function Groups() {
  const { items, loading, create, update, remove } = useResource(groupsApi)
  const { items: courses } = useResource(coursesApi)
  const { items: mentors } = useResource(mentorsApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [detailGroup, setDetailGroup] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((g) => [g.name, g.branch, g.course?.name].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
  }, [items, query])

  const columns = [
    {
      key: 'name',
      header: 'Group',
      render: (g) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
            <Layers className="h-4.5 w-4.5" />
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{g.name}</p>
            <p className="text-xs text-slate-400">{g.course?.name}</p>
          </div>
        </div>
      ),
    },
    { key: 'branch', header: 'Branch' },
    { key: 'dates', header: 'Duration', render: (g) => `${formatDate(g.start_time)} – ${formatDate(g.end_time)}` },
    { key: 'status', header: 'Status', render: (g) => <Badge tone={g.status ? 'success' : 'neutral'}>{g.status ? 'Active' : 'Inactive'}</Badge> },
    {
      key: 'actions',
      header: '',
      render: (g) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setDetailGroup(g)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => setModal({ mode: 'edit', group: g })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
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
        title="Groups"
        subtitle={`${items.length} group${items.length === 1 ? '' : 's'} across all courses`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })} disabled={courses.length === 0}>
            <Plus className="h-4 w-4" /> Add group
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search groups…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyTitle="No groups yet" emptyDescription="Create a group to start scheduling classes." />

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit group' : 'Add group'}>
        {modal && (
          <GroupForm
            defaultValues={modal.mode === 'edit' ? modal.group : { name: '', description: '', branch: '', start_time: '', end_time: '' }}
            courses={courses}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create group'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.group.id, values), { success: 'Group updated' })
                } else {
                  await withToast(() => create(values), { success: 'Group created' })
                }
                setModal(null)
              } catch {
                // error already toasted
              }
            }}
          />
        )}
      </Modal>

      <Modal open={!!detailGroup} onClose={() => setDetailGroup(null)} title={detailGroup?.name} description="Group overview, mentor assignment and roster" size="lg">
        {detailGroup && <GroupDetail group={detailGroup} mentors={mentors} />}
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete group?"
        description={deleteTarget ? `${deleteTarget.name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Group deleted' })}
      />
    </div>
  )
}
