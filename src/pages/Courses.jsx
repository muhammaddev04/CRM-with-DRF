import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Plus, Search, Pencil, Trash2, BookOpen } from 'lucide-react'
import { coursesApi } from '../api/resources'
import { useResource, withToast } from '../hooks/useResource'
import PageHeader from '../components/ui/PageHeader'
import Button from '../components/ui/Button'
import Card from '../components/ui/Card'
import Modal from '../components/ui/Modal'
import ConfirmDialog from '../components/ui/ConfirmDialog'
import EmptyState from '../components/ui/EmptyState'
import Skeleton from '../components/ui/Skeleton'
import { Input, Textarea } from '../components/ui/Field'
import { formatCurrency } from '../lib/format'

function CourseForm({ defaultValues, onSubmit, submitLabel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ defaultValues })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input label="Course name" required error={errors.name?.message} {...register('name', { required: 'Required' })} />
      <Textarea label="Description" required error={errors.description?.message} {...register('description', { required: 'Required' })} />
      <Input
        label="Price"
        type="number"
        step="0.01"
        min="0"
        required
        error={errors.price?.message}
        {...register('price', { required: 'Required', valueAsNumber: true })}
      />
      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}

export default function Courses() {
  const { items, loading, create, update, remove } = useResource(coursesApi)
  const [query, setQuery] = useState('')
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return items
    return items.filter((c) => c.name?.toLowerCase().includes(q))
  }, [items, query])

  return (
    <div>
      <PageHeader
        title="Courses"
        subtitle={`${items.length} course${items.length === 1 ? '' : 's'} in your catalog`}
        actions={
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="h-4 w-4" /> Add course
          </Button>
        }
      />

      <div className="relative mb-4 max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search courses…"
          className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm focus-ring dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <EmptyState icon={BookOpen} title="No courses yet" description="Add your first course to build your catalog." />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <Card key={course.id} hover className="flex flex-col">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ mode: 'edit', course })} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-brand-600 dark:hover:bg-white/10">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => setDeleteTarget(course)} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-500/10">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-100">{course.name}</h3>
              <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500 dark:text-slate-400">{course.description}</p>
              <p className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(course.price)}</p>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={modal?.mode === 'edit' ? 'Edit course' : 'Add course'}
      >
        {modal && (
          <CourseForm
            defaultValues={modal.mode === 'edit' ? modal.course : { name: '', description: '', price: '' }}
            submitLabel={modal.mode === 'edit' ? 'Save changes' : 'Create course'}
            onSubmit={async (values) => {
              try {
                if (modal.mode === 'edit') {
                  await withToast(() => update(modal.course.id, values), { success: 'Course updated' })
                } else {
                  await withToast(() => create(values), { success: 'Course created' })
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
        title="Delete course?"
        description={deleteTarget ? `${deleteTarget.name} will be permanently removed.` : ''}
        onConfirm={() => withToast(() => remove(deleteTarget.id), { success: 'Course deleted' })}
      />
    </div>
  )
}
