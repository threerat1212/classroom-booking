'use client'

import { StatusBadge } from '@/components/shared/status-badge'
import { useCurrentUser } from '@/hooks/useCurrentUser'

export default function ProfilePage() {
  const { user } = useCurrentUser()

  if (!user) {
    return <p className="text-sm text-slate-400">Loading profile...</p>
  }

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile</h1>
        <p className="mt-1 text-sm text-slate-400">Your account information</p>
      </div>
      <div className="rounded-lg border border-white/10 bg-white/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Full Name</span>
          <span className="text-sm font-medium text-white">{user.full_name}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Email</span>
          <span className="text-sm font-medium text-white">{user.email}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">Role</span>
          <StatusBadge status={user.role} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-400">User ID</span>
          <span className="text-xs font-mono text-white/50">{user.id}</span>
        </div>
      </div>
    </div>
  )
}
