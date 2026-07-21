import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Plus, Search, Pencil, Trash2, Mail, Phone, Eye } from 'lucide-react'
import { studentsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import { Input, Textarea } from '../components/ui/Field'
import { formatDate, initials } from '../lib/format'

function StudentForm({ defaultValues, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="First name" required error={errors.f_name?.message} {...register('f_name', { required: 'Required' })} />
        <Input label="Last name" required error={errors.l_name?.message} {...register('l_name', { required: 'Required' })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Email" type="email" required error={errors.email?.message} {...register('email', { required: 'Required' })} />
        <Input label="Phone" required error={errors.phone?.message} {...register('phone', { required: 'Required' })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Birthdate" type="date" required error={errors.birthdate?.message} {...register('birthdate', { required: 'Required' })} />
        {!defaultValues?.id && (
          <Input
            label="Linked account ID"
            type="number"
            required
            hint="Numeric user ID from Settings → Create account"
            error={errors.user_id?.message}
            {...register('user_id', { required: 'Required', valueAsNumber: true })}
          />
        )}
      </div>
      <Textarea label="Address" required error={errors.adress?.message} {...register('adress', { required: 'Required' })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Students() {
  const navigate = useNavigate()
  const { items, loading, create, update, remove } = useResource(studentsApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null) // { mode: 'create'|'edit', student }
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((s) =>
      [s.f_name, s.l_name, s.email, s.phone].filter(Boolean).some((v) => v.toLowerCase().includes(q))
    )
  }, [items, query])

  const columns = [
    {
      key: 'name',
      header: 'Student',
      render: (s) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">
            {initials(s.f_name, s.l_name)}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{s.f_name} {s.l_name}</p>
            <p className="text-xs text-slate-400">{s.user?.username}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'contact',
      header: 'Contact',
      render: (s) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500"><Mail className="h-3.5 w-3.5" />{s.email}</div>
          <div className="flex items-center gap-1.5 text-slate-500"><Phone className="h-3.5 w-3.5" />{s.phone}</div>
        </div>
      ),
    },
    { key: 'birthdate', header: 'Birthdate', render: (s) => formatDate(s.birthdate) },
    { key: 'adress', header: 'Address', render: (s) => <span className="line-clamp-1 max-w-[200px] text-slate-500">{s.adress}</span> },
    {
      key: 'actions',
      header: '',
      render: (s) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => navigate(`/app/students/${s.id}`)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Eye className="h-4 w-4" />
          </button>
          <button onClick={() => setModal({ mode: 'edit', student: s })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(s)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Students"
        subtitle={`${items.length} student${items.length === 1 ? '' : 's'} enrolled in the academy`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Add student
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search students…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table
        columns={columns}
        data={filtered}
        loading={loading}
        emptyTitle="No students yet"
        emptyDescription="Add your first student to get started."
        rowKey="id"
      />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit student' : 'Add student'}
        description={modal?.mode === 'edit' ? 'Update this student’s profile.' : 'Create a profile for an existing account.'}
      >
        {modal && (
          <StudentForm
            defaultValues={
              modal.mode === 'edit'
                ? modal.student
                : { f_name: '', l_name: '', email: '', phone: '', birthdate: '', adress: '', user_id: '' }
            }
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create student'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.student.id, values), { success: 'Student updated' })
                } else {
                  await withToast(() => create(values), { success: 'Student created' })
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
        title="Delete student?"
        description={deleteTarget ? `${deleteTarget.f_name} ${deleteTarget.l_name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Student deleted' })}
      />
    </div>
  )
}
