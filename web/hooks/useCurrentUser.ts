'use client'

import { useCallback, useEffect, useState } from 'react'
import { getAccessToken, getStoredUser, setStoredUser, clearSession, StoredUser, USER_CHANGED_EVENT } from '@/lib/auth/session'
import { apiFetch } from '@/lib/http/client'

function normalizeUser(user: StoredUser): StoredUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    xp: user.xp,
    level: user.level,
    gold_balance: user.gold_balance,
    rank_title: user.rank_title,
    grade_level: user.grade_level,
  }
}

export function useCurrentUser() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const refreshUser = useCallback(async () => {
    const res = await apiFetch<{ data: StoredUser }>('/api/v1/auth/me')
    const nextUser = normalizeUser(res.data)
    setStoredUser(nextUser)
    setUser(nextUser)
    return nextUser
  }, [])

  useEffect(() => {
    let cancelled = false
    const u = getStoredUser()
    const token = getAccessToken()

    if (u && token) {
      setUser(u)
      setIsLoading(false)
    } else if (u && !token) {
      clearSession()
    }

    const handleUserChange = (event: Event) => {
      const nextUser = (event as CustomEvent<StoredUser | null>).detail
      setUser(nextUser)
    }
    window.addEventListener(USER_CHANGED_EVENT, handleUserChange)

    if (!token) {
      setIsLoading(false)
      return () => {
        cancelled = true
        window.removeEventListener(USER_CHANGED_EVENT, handleUserChange)
      }
    }

    refreshUser()
      .then((nextUser) => {
        if (cancelled) return
        setUser(nextUser)
      })
      .catch(() => {
        if (!cancelled && !u) setUser(null)
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })

    return () => {
      cancelled = true
      window.removeEventListener(USER_CHANGED_EVENT, handleUserChange)
    }
  }, [refreshUser])

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
    refreshUser,
    signOut,
  }
}
