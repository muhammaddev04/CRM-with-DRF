import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { login as loginRequest } from '../api/auth'
import { setAuthFailureHandler } from '../api/client'
import { tokenStorage } from '../lib/tokenStorage'
import { decodeAccessToken } from '../lib/jwt'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => !!tokenStorage.getRefresh())
  const [tokenPayload, setTokenPayload] = useState(() => decodeAccessToken(tokenStorage.getAccess()))

  const logout = useCallback(() => {
    tokenStorage.clear()
    setTokenPayload(null)
    setIsAuthenticated(false)
  }, [])

  // Wired once so any 401->refresh failure anywhere in the app (api/client.js)
  // drops the user back to a logged-out state.
  useState(() => setAuthFailureHandler(logout))

  const login = useCallback(async (username, password) => {
    const data = await loginRequest(username, password)
    tokenStorage.set(data.access, data.refresh)
    setTokenPayload(decodeAccessToken(data.access))
    setIsAuthenticated(true)
    return data
  }, [])

  const value = useMemo(
    () => ({ isAuthenticated, login, logout, tokenPayload, userId: tokenPayload?.user_id ?? null }),
    [isAuthenticated, login, logout, tokenPayload]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
