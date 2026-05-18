'use client'

import { ClipboardList, Users, Award } from 'lucide-react'
import { useQueries } from '@tanstack/react-query'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { listAssignments } from '@/lib/api/assignments'
import { listSubmissions } from '@/lib/api/submissions'
import { assignmentKeys, submissionKeys } from '@/lib/query/keys'
import { Skeleton } from '@/components/ui/skeleton'

function useStudentStats(studentId?: string) {
  return useQueries({
    queries: [
      {
        queryKey: assignmentKeys.lists(),
        queryFn: listAssignments,
        select: (res: { data: unknown[] }) => res.data.length,
        enabled: !!studentId,
      },
      {
        queryKey: submissionKeys.lists(),
        queryFn: () => listSubmissions(undefined, studentId),
        select: (res: { data: unknown[] }) => res.data.length,
        enabled: !!studentId,
      },
    ],
  })
}

export default function StudentDashboardPage() {
  const { user } = useCurrentUser()
  const stats = useStudentStats(user?.id)

  const assignmentCount = stats[0].data ?? 0
  const submissionCount = stats[1].data ?? 0
  const pendingCount = Math.max(0, assignmentCount - submissionCount)
  const isLoading = stats.some((s) => s.isLoading)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Student Dashboard</h1>
        <p className="mt-1 text-sm text-slate-400">Welcome back, {user?.full_name || 'Student'}</p>
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'My Assignments', value: assignmentCount, description: `${pendingCount} pending submission`, icon: ClipboardList },
          { label: 'Submissions', value: submissionCount, description: 'Submitted so far', icon: Users },
          { label: 'Pending', value: pendingCount, description: 'Awaiting submission', icon: Award },
        ].map((item) => (
          <div key={item.label} className="rounded-lg border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-slate-400">{item.label}</div>
              <item.icon className="h-4 w-4 text-slate-500" />
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {isLoading ? <Skeleton className="h-8 w-12" /> : item.value}
            </div>
            <div className="mt-1 text-xs text-slate-400">{item.description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
