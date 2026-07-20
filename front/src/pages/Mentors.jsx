import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, Mail, Phone } from 'lucide-react'
import { mentorsApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Table from '../components/ui/Table'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import Badge from '../components/ui/Badge'
import { Input, Textarea, Select } from '../components/ui/Field'
import { formatDate, initials, capitalize } from '../lib/format'

const levelTone = { JUNIOR: 'info', MIDDLE: 'warning', SENIOR: 'success' }

function MentorForm({ defaultValues, onSubmit, submitLabel }) {
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
        <Select label="Level" required error={errors.level?.message} {...register('level', { required: 'Required' })}>
          <option value="JUNIOR">Junior</option>
          <option value="MIDDLE">Middle</option>
          <option value="SENIOR">Senior</option>
        </Select>
      </div>
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
      <Textarea label="Address" required error={errors.adress?.message} {...register('adress', { required: 'Required' })} />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Mentors() {
  const { items, loading, create, update, remove } = useResource(mentorsApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((m) => [m.f_name, m.l_name, m.email].filter(Boolean).some((v) => v.toLowerCase().includes(q)))
  }, [items, query])

  const columns = [
    {
      key: 'name',
      header: 'Mentor',
      render: (m) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300">
            {initials(m.f_name, m.l_name)}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-100">{m.f_name} {m.l_name}</p>
            <p className="text-xs text-slate-400">{m.user?.username}</p>
          </div>
        </div>
      ),
    },
    { key: 'level', header: 'Level', render: (m) => <Badge tone={levelTone[m.level] ?? 'neutral'}>{capitalize(m.level)}</Badge> },
    {
      key: 'contact',
      header: 'Contact',
      render: (m) => (
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500"><Mail className="h-3.5 w-3.5" />{m.email}</div>
          <div className="flex items-center gap-1.5 text-slate-500"><Phone className="h-3.5 w-3.5" />{m.phone}</div>
        </div>
      ),
    },
    { key: 'birthdate', header: 'Birthdate', render: (m) => formatDate(m.birthdate) },
    {
      key: 'actions',
      header: '',
      render: (m) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setModal({ mode: 'edit', mentor: m })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={() => setDeleteTarget(m)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ]

  return (
    <div>
      <PageHeader
        title="Mentors"
        subtitle={`${items.length} mentor${items.length === 1 ? '' : 's'} on your team`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Add mentor
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search mentors…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      <Table columns={columns} data={filtered} loading={loading} emptyTitle="No mentors yet" emptyDescription="Add your first mentor to get started." />

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit mentor' : 'Add mentor'}
        description={modal?.mode === 'edit' ? 'Update this mentor’s profile.' : 'Create a profile for an existing account.'}
      >
        {modal && (
          <MentorForm
            defaultValues={
              modal.mode === 'edit'
                ? modal.mentor
                : { f_name: '', l_name: '', email: '', phone: '', birthdate: '', adress: '', level: 'JUNIOR', user_id: '' }
            }
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create mentor'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.mentor.id, values), { success: 'Mentor updated' })
                } else {
                  await withToast(() => create(values), { success: 'Mentor created' })
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
        title="Delete mentor?"
        description={deleteTarget ? `${deleteTarget.f_name} ${deleteTarget.l_name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Mentor deleted' })}
      />
    </div>
  )
}
