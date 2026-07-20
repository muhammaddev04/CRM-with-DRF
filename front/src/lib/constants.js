export const WEEKDAYS = [
  ['DUSHANBE', 'Dushanbe (Mon)'],
  ['SESHANBE', 'Seshanbe (Tue)'],
  ['CHORSHANBE', 'Chorshanbe (Wed)'],
  ['PANJSHANBE', 'Panjshanbe (Thu)'],
  ['JUMA', 'Juma (Fri)'],
  ['SHANBE', 'Shanbe (Sat)'],
  ['YAKSHANBE', 'Yakshanbe (Sun)'],
]

export function weekdayLabel(value) {
  return WEEKDAYS.find(([v]) => v === value)?.[1] ?? value
}

export function timetableLabel(t) {
  if (!t) return '—'
  return `${t.group?.name ?? 'Group'} — ${weekdayLabel(t.weekday)} · ${t.type === 'EXAM' ? 'Exam' : 'Practice'}`
}
