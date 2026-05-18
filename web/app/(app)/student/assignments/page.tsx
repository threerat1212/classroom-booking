'use client'

import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'

interface Assignment {
  id: string
  title: string
  assignment_type: string
  max_score?: number
  due_date?: string
  status: string
}

function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Assignment[] }>('/api/v1/assignments')
      return res.data
    },
  })
}

export default function StudentAssignmentsPage() {
  const { data: assignments, isLoading, error, refetch } = useAssignments()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Assignments</h1>
        <p className="mt-1 text-sm text-slate-400">View your assigned coursework</p>
      </div>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (a) => <span className="font-medium">{a.title}</span> },
          { key: 'type', header: 'Type', cell: (a) => a.assignment_type },
          { key: 'max_score', header: 'Max Score', cell: (a) => a.max_score ?? '-' },
          { key: 'due_date', header: 'Due Date', cell: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '-' },
          { key: 'status', header: 'Status', cell: (a) => <StatusBadge status={a.status} /> },
        ]}
        data={assignments}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load assignments"
        onRetry={refetch}
        emptyTitle="No assignments yet"
        emptyMessage="You have no assignments at this time."
      />
    </div>
  )
}
