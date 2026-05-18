'use client'

import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'

interface Notification {
  id: string
  title: string
  message: string
  type: string
  created_at: string
  read_at?: string
}

function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Notification[] }>('/api/v1/notifications')
      return res.data
    },
  })
}

export default function NotificationsPage() {
  const { data: notifications, isLoading } = useNotifications()

  if (isLoading) return <LoadingSkeleton rows={4} columns={1} />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Notifications</h1>
        <p className="mt-1 text-sm text-slate-400">Stay updated with your activity</p>
      </div>
      {notifications?.length === 0 && (
        <EmptyState title="No notifications yet" message="You will see updates here when there is new activity." />
      )}
      <div className="space-y-3">
        {notifications?.map((n) => (
          <div key={n.id} className={`rounded-lg border p-4 ${n.read_at ? 'border-white/10 bg-white/5' : 'border-white/10 bg-white/5'}`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-white">{n.title}</p>
              <span className="text-xs text-slate-400">{new Date(n.created_at).toLocaleString()}</span>
            </div>
            <p className="mt-1 text-sm text-slate-300">{n.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
