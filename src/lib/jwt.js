import { jwtDecode } from 'jwt-decode'

// SimpleJWT's default access-token payload only carries user_id / exp / iat / jti —
// no username or role claim, since the backend's TokenObtainPairSerializer isn't customized.
export function decodeAccessToken(token) {
  if (!token) return null
  try {
    return jwtDecode(token)
  } catch {
    return null
  }
}

export function isTokenExpired(token) {
  const payload = decodeAccessToken(token)
  if (!payload?.exp) return true
  return Date.now() >= payload.exp * 1000
}
