'use client'

import { useCallback, useEffect, useState } from 'react'
import { getStoredUser, clearSession, StoredUser } from '@/lib/auth/session'

export function useCurrentUser() {
  const [user, setUser] = useState<StoredUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const u = getStoredUser()
    setUser(u)
    setIsLoading(false)
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
