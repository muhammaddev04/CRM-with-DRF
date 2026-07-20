import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { extractErrorMessage } from '../api/client'

// Generic list+CRUD state manager shared by every resource page
// (Students, Mentors, Courses, Groups, Enrollments, Timetable, Grades...).
export function useResource(resourceApi, { auto = true } = {}) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(auto)
  const [error, setError] = useState(null)

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await resourceApi.list()
      setItems(Array.isArray(data) ? data : data?.results ?? [])
    } catch (err) {
      setError(extractErrorMessage(err, 'Failed to load data'))
    } finally {
      setLoading(false)
    }
  }, [resourceApi])

  useEffect(() => {
    if (auto) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const create = useCallback(
    async (payload) => {
      const created = await resourceApi.create(payload)
      setItems((prev) => [created, ...prev])
      return created
    },
    [resourceApi]
  )

  const update = useCallback(
    async (id, payload) => {
      const updated = await resourceApi.update(id, payload)
      setItems((prev) => prev.map((item) => (item.id === id ? updated : item)))
      return updated
    },
    [resourceApi]
  )

  const remove = useCallback(
    async (id) => {
      await resourceApi.remove(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
    },
    [resourceApi]
  )

  return { items, loading, error, refresh, create, update, remove, setItems }
}

// Wraps a submit handler with try/catch + toast, so every form in the app
// reports backend errors (including the pre-existing 500s from a couple of
// serializer bugs) instead of failing silently.
export async function withToast(action, { success, errorFallback = 'Request failed' } = {}) {
  try {
    const result = await action()
    if (success) toast.success(success)
    return result
  } catch (err) {
    toast.error(extractErrorMessage(err, errorFallback))
    throw err
  }
}
