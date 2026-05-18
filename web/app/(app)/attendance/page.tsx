'use client'

import { useQuery } from '@tanstack/react-query'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { listSessions } from '@/lib/api/attendance'

export default function AttendancePage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['attendance-sessions'],
    queryFn: async () => {
      const res = await listSessions()
      return res.data
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Attendance</h1>
        <p className="mt-1 text-sm text-slate-400">Track student attendance sessions</p>
      </div>
      <DataTable
        columns={[
          { key: 'id', header: 'ID', cell: (row) => <span className="font-mono text-xs">{row.id.slice(0, 8)}</span> },
          { key: 'room', header: 'Room', cell: (row) => row.room_id },
          { key: 'date', header: 'Date', cell: (row) => row.session_date },
          { key: 'time', header: 'Time', cell: (row) => `${row.start_time} - ${row.end_time}` },
          { key: 'status', header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
        ]}
        data={data}
        isLoading={isLoading}
        isError={isError}
        onRetry={refetch}
        emptyTitle="No sessions yet"
        emptyMessage="Create an attendance session to get started."
      />
    </div>
  )
}
