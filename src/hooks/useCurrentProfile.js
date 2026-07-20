import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { studentsApi, mentorsApi } from '../api/resources'

// The backend never returns "who am I" — the JWT only carries user_id, and
// there's no /me/ endpoint. Best-effort identity: cross-reference the
// students/mentors lists (which nest the related auth user) for a match.
// No match => treated as an admin/staff account.
export function useCurrentProfile() {
  const { userId, isAuthenticated } = useAuth()
  const [state, setState] = useState({ loading: true, kind: 'unknown', record: null })

  useEffect(() => {
    let cancelled = false
    if (!isAuthenticated || !userId) {
      setState({ loading: false, kind: 'unknown', record: null })
      return
    }

    setState((s) => ({ ...s, loading: true }))
    Promise.allSettled([studentsApi.list(), mentorsApi.list()]).then(([studentsRes, mentorsRes]) => {
      if (cancelled) return
      const students = studentsRes.status === 'fulfilled' ? studentsRes.value : []
      const mentors = mentorsRes.status === 'fulfilled' ? mentorsRes.value : []

      const student = students.find((s) => s.user?.id === userId)
      if (student) {
        setState({ loading: false, kind: 'student', record: student })
        return
      }
      const mentor = mentors.find((m) => m.user?.id === userId)
      if (mentor) {
        setState({ loading: false, kind: 'mentor', record: mentor })
        return
      }
      setState({ loading: false, kind: 'admin', record: null })
    })

    return () => {
      cancelled = true
    }
  }, [userId, isAuthenticated])

  return state
}
