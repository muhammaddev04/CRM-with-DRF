import { api } from './client'

// POST /auth/login/ — SimpleJWT TokenObtainPairView, returns { access, refresh }
export const login = (username, password) =>
  api.post('/auth/login/', { username, password }).then((res) => res.data)

// POST /auth/register/ — admin-only (RegisterView requires IsAdmin)
export const registerAccount = (payload) =>
  api.post('/auth/register/', payload).then((res) => res.data)

// POST /auth/refresh/ — also used directly by api/client.js's interceptor
export const refreshToken = (refresh) =>
  api.post('/auth/refresh/', { refresh }).then((res) => res.data)
