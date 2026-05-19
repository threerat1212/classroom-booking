'use client'

import { useCallback, useEffect, useState } from 'react'
import { getStoredUser, setStoredUser, clearSession, StoredUser } from '@/lib/auth/session'
import { apiFetch } from '@/lib/http/client'

export function useCurrentUser() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const u = getStoredUser()
    if (u) {
      setUser(u)
      setIsLoading(false)
      return
    }

    apiFetch<{ data: StoredUser }>('/api/v1/auth/me')
      .then((res) => {
        if (cancelled) return
        const nextUser = {
          id: res.data.id,
          email: res.data.email,
          full_name: res.data.full_name,
          role: res.data.role,
          xp: res.data.xp,
          level: res.data.level,
          rank_title: res.data.rank_title,
        }
        setStoredUser(nextUser)
        setUser(nextUser)
      })
      .catch(() => {
        if (!cancelled) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const signOut = useCallback(() => {
    clearSession()
    document.cookie = 'access_token=; path=/; max-age=0'
    setUser(null)
    window.location.href = '/login'
  }, [])

  return {
    user,
    role: user?.role ?? null,
    isAuthenticated: !!user,
    isLoading,
    signOut,
  }
}
