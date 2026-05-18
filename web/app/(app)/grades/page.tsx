'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@/components/shared/data-table'
import { listGrades } from '@/lib/api/grades'

export default function GradesPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['grades'],
    queryFn: async () => {
      const res = await listGrades()
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Grades</h1>
        <p className="mt-1 text-sm text-slate-400">View and manage student grades</p>
      </div>
      <DataTable
        columns={[
          { key: 'student', header: 'Student', cell: (row) => <span className="font-mono text-xs">{row.student_id.slice(0, 8)}</span> },
          { key: 'item', header: 'Item', cell: (row) => `${row.item_type} (${row.item_id.slice(0, 8)})` },
          { key: 'score', header: 'Score', cell: (row) => `${row.score} / ${row.max_score}` },
          { key: 'feedback', header: 'Feedback', cell: (row) => row.feedback || '-' },
        ]}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No grades yet"
        emptyMessage="Start grading assignments to populate this list."
      />
    </div>
  )
}
