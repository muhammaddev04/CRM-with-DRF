export function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatDateTime(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatCurrency(value) {
  const num = Number(value)
  if (Number.isNaN(num)) return '—'
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(num)
}

export function initials(...parts) {
  return parts
    .filter(Boolean)
    .map((p) => p.trim()[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function capitalize(value) {
  if (!value) return ''
  return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
}

export function timeAgo(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  const steps = [
    ['year', 31536000],
    ['month', 2592000],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
  ]
  for (const [unit, secs] of steps) {
    const amount = Math.floor(seconds / secs)
    if (amount >= 1) return `${amount} ${unit}${amount > 1 ? 's' : ''} ago`
  }
  return 'just now'
}
