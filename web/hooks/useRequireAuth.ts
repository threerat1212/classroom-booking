'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCurrentUser } from './useCurrentUser'

export function useRequireAuth(allowedRoles?: string[]) {
  const router = useRouter()
  const { user, isLoading } = useCurrentUser()

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login')
    }
    if (!isLoading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [isLoading, user, router, allowedRoles])

  return { user, isLoading }
}
