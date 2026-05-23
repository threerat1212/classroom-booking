export const ACCESS_TOKEN_KEY = 'access_token'
export const USER_KEY = 'stored_user'
export const USER_CHANGED_EVENT = 'stored_user_changed'

export interface StoredUser {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'teacher' | 'student' | 'guest'
  xp?: number
  level?: number
  gold_balance?: number
  rank_title?: string
  grade_level?: string
}

interface TokenClaims {
  user_id?: string
  sub?: string
  email?: string
  role?: string
  exp?: number
}

function getCookieValue(name: string): string | null {
  if (typeof document === 'undefined') return null
  const prefix = `${name}=`
  const match = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))

  return match ? decodeURIComponent(match.slice(prefix.length)) : null
}

function decodeJwtPayload(token: string): TokenClaims | null {
  const payload = token.split('.')[1]
  if (!payload) return null

  try {
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=')
    return JSON.parse(atob(padded)) as TokenClaims
  } catch {
    return null
  }
}

function isStoredUserRole(role: unknown): role is StoredUser['role'] {
  return role === 'admin' || role === 'teacher' || role === 'student' || role === 'guest'
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(ACCESS_TOKEN_KEY) || getCookieValue(ACCESS_TOKEN_KEY)
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(USER_KEY)
  if (raw) {
    try {
      return JSON.parse(raw) as StoredUser
    } catch {
      clearStoredUser()
    }
  }

  const token = getAccessToken()
  if (!token) return null

  const claims = decodeJwtPayload(token)
  if (!claims || !isStoredUserRole(claims.role)) return null

  return {
    id: claims.user_id || claims.sub || '',
    email: claims.email || '',
    full_name: claims.email || 'User',
    role: claims.role,
  }
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(USER_KEY, JSON.stringify(user))
  window.dispatchEvent(new CustomEvent<StoredUser>(USER_CHANGED_EVENT, { detail: user }))
}

export function clearStoredUser(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
  window.dispatchEvent(new CustomEvent<StoredUser | null>(USER_CHANGED_EVENT, { detail: null }))
}

export function clearSession(): void {
  clearAccessToken()
  clearStoredUser()
}
