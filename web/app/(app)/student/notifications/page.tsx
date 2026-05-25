'use client'

import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { listNotifications, markAllRead, type Notification } from '@/lib/api/notifications'
import { EmptyState } from '@/components/shared/empty-state'
import { LoadingSkeleton } from '@/components/shared/loading-skeleton'
import { notificationKeys } from '@/lib/query/keys'

function useNotifications() {
  return useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: async () => {
      const res = await listNotifications()
      return res.data
    },
  })
}

export default function NotificationsPage() {
  const queryClient = useQueryClient()
  const { data: notifications, isLoading } = useNotifications()
  const unreadCount = notifications?.filter((notification) => !notification.read_at).length ?? 0
  const { mutate: markAllReadNow, isPending: isMarkingAllRead } = useMutation({
    mutationFn: markAllRead,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: notificationKeys.lists() })
      const previous = queryClient.getQueryData<Notification[]>(notificationKeys.lists())
      const readAt = new Date().toISOString()

      queryClient.setQueryData<Notification[]>(notificationKeys.lists(), (current) =>
        current?.map((notification) => ({
          ...notification,
          read_at: notification.read_at ?? readAt,
        })),
      )

      return { previous }
    },
    onError: (_error, _variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(notificationKeys.lists(), context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.lists() })
    },
  })

  useEffect(() => {
    if (unreadCount > 0 && !isMarkingAllRead) {
      markAllReadNow()
    }
  }, [isMarkingAllRead, markAllReadNow, unreadCount])

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
          <div key={n.id} className={`rounded-lg border p-4 ${n.read_at ? 'border-white/10 bg-white/5 opacity-80' : 'border-blue-400/40 bg-blue-500/10'}`}>
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
