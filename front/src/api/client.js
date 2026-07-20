import axios from 'axios'
import { tokenStorage } from '../lib/tokenStorage'

// Relative baseURL: the Vite dev server proxies the real backend path
// prefixes straight through (see vite.config.js) so this works with zero
// backend changes, in dev or behind any same-origin reverse proxy in prod.
export const api = axios.create({ baseURL: '/' })

let onAuthFailure = () => {}
export function setAuthFailureHandler(handler) {
  onAuthFailure = handler
}

api.interceptors.request.use((config) => {
  const token = tokenStorage.getAccess()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

let refreshPromise = null

async function refreshAccessToken() {
  const refresh = tokenStorage.getRefresh()
  if (!refresh) throw new Error('No refresh token available')
  // Plain axios call — bypasses the interceptors above to avoid recursion.
  const { data } = await axios.post('/auth/refresh/', { refresh })
  tokenStorage.setAccess(data.access)
  return data.access
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error
    const isAuthEndpoint = config?.url?.startsWith('/auth/')

    if (response?.status === 401 && !config._retry && !isAuthEndpoint) {
      config._retry = true
      try {
        refreshPromise = refreshPromise || refreshAccessToken()
        const access = await refreshPromise
        refreshPromise = null
        config.headers.Authorization = `Bearer ${access}`
        return api(config)
      } catch (refreshError) {
        refreshPromise = null
        tokenStorage.clear()
        onAuthFailure()
        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

// Pulls the first meaningful message out of a DRF error response,
// whatever shape it happens to be (field errors, detail, non_field_errors, or a raw 500).
export function extractErrorMessage(error, fallback = 'Something went wrong') {
  const status = error?.response?.status
  const data = error?.response?.data

  if (status >= 500) {
    // DEBUG=True backends return a full HTML/text traceback dump here —
    // never surface that to the user, just say the server choked.
    return 'The server hit an internal error handling this request.'
  }

  if (!data) return error?.message || fallback
  if (typeof data === 'string') {
    const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(data)
    return looksLikeHtml || data.length > 300 ? fallback : data
  }
  if (data.detail) return data.detail
  if (Array.isArray(data.non_field_errors)) return data.non_field_errors[0]
  const firstKey = Object.keys(data)[0]
  if (firstKey) {
    const value = data[firstKey]
    const message = Array.isArray(value) ? value[0] : value
    return `${firstKey}: ${message}`
  }
  return fallback
}
