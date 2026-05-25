'use client'

import Link from 'next/link'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { listAssignments } from '@/lib/api/assignments'
import { listSubmissions } from '@/lib/api/submissions'
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
      return listAssignments().then((res) => res.data)
    },
  })
}

export default function StudentAssignmentsPage() {
  const { data: assignments, isLoading, error, refetch } = useAssignments()
  const { data: submissionsRes } = useQuery({ queryKey: ['my-submissions'], queryFn: () => listSubmissions(undefined, undefined).then(r => r.data) })
  const submissionMap = new Map((submissionsRes ?? []).map((s) => [s.assignment_id, s]))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My Assignments</h1>
        <p className="mt-1 text-sm text-slate-400">View your assigned coursework</p>
      </div>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (a) => <Link href={`/student/submissions/${a.id}`} className="font-medium text-blue-300 hover:text-blue-200">{a.title}</Link> },
          { key: 'type', header: 'Type', cell: (a) => a.assignment_type },
          { key: 'max_score', header: 'Max Score', cell: (a) => a.max_score ?? '-' },
          { key: 'due_date', header: 'Due Date', cell: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '-' },
          { key: 'grade', header: 'Grade', cell: (a) => { const sub = submissionMap.get(a.id); return sub?.grade_code ? <span className='rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700'>{sub.grade_code}</span> : (sub?.score !== undefined ? <span className='text-xs text-slate-400'>-</span> : '-') } },
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
