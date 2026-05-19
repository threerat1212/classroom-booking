import { getAccessToken, setAccessToken } from '@/lib/auth/session'

export const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

export class ApiError extends Error {
  status: number
  code: string
  details?: string

  constructor(status: number, code: string, message: string, details?: string) {
    super(message)
    this.status = status
    this.code = code
    this.details = details
  }
}

export function isApiError(err: unknown): err is ApiError {
  return err instanceof ApiError
}

export function isUnauthorized(err: unknown): boolean {
  return isApiError(err) && err.status === 401
}

export function isConflict(err: unknown): boolean {
  return isApiError(err) && err.status === 409
}

export interface FetchOptions extends RequestInit {
  userRole?: string
  skipAuthRefresh?: boolean
}

async function refreshAccessToken(): Promise<string | null> {
  const res = await fetch(`${API_BASE}/api/v1/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })

  if (!res.ok) return null

  const body = await res.json().catch(() => null) as { data?: { access_token?: string } } | null
  const token = body?.data?.access_token
  if (!token) return null

  setAccessToken(token)
  document.cookie = `access_token=${token}; path=/; max-age=86400`

  return token
}

export async function apiFetch<T>(path: string, opts: FetchOptions = {}): Promise<T> {
  const url = `${API_BASE}${path}`
  const headers = new Headers(opts.headers)

  if (!headers.has('Content-Type') && opts.body && typeof opts.body === 'string') {
    headers.set('Content-Type', 'application/json')
  }

  const token = typeof window !== 'undefined' ? getAccessToken() : null
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const res = await fetch(url, {
    ...opts,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && !opts.skipAuthRefresh) {
    const refreshedToken = await refreshAccessToken()
    if (refreshedToken) {
      const retryHeaders = new Headers(opts.headers)
      if (!retryHeaders.has('Content-Type') && opts.body && typeof opts.body === 'string') {
        retryHeaders.set('Content-Type', 'application/json')
      }
      retryHeaders.set('Authorization', `Bearer ${refreshedToken}`)

      return apiFetch<T>(path, {
        ...opts,
        headers: retryHeaders,
        skipAuthRefresh: true,
      })
    }
  }

  if (res.status === 204) {
    return undefined as T
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      body.error?.code || 'UNKNOWN',
      body.error?.message || `HTTP ${res.status}`,
      body.error?.details,
    )
  }

  return res.json() as Promise<T>
}

export function buildQuery(params: Record<string, string | number | boolean | undefined>): string {
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      q.set(key, String(value))
    }
  }
  const qs = q.toString()
  return qs ? `?${qs}` : ''
}

export function apiErrorMessage(err: unknown): string {
  if (isApiError(err)) return err.message
  if (err instanceof Error) return err.message
  return 'An unexpected error occurred'
}
