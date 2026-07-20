import Modal from './Modal'
import Button from './Button'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'

export default function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', description, confirmLabel = 'Delete' }) {
  const [loading, setLoading] = useState(false)

  const handleConfirm = async () => {
    setLoading(true)
    try {
      await onConfirm()
      onClose()
    } catch {
      // the action already surfaced a toast — just keep the dialog open
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} size="sm">
      <div className="flex flex-col items-center text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
        {description && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{description}</p>}
        <div className="mt-6 flex w-full gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" loading={loading} onClick={handleConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
