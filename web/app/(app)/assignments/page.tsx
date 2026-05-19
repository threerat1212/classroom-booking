'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { RowActions } from '@/components/shared/row-actions'
import { FilterBar } from '@/components/shared/filter-bar'
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
      const res = await apiFetch<{ data: Assignment[] | null }>('/api/v1/assignments')
      return res.data || []
    },
  })
}

export default function AssignmentsPage() {
  const router = useRouter()
  const { data: assignments, isLoading, error, refetch } = useAssignments()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredAssignments = useMemo(() => {
    if (!assignments) return assignments
    return assignments.filter((a) => {
      const matchesSearch = !search ||
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.assignment_type.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || a.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [assignments, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Assignments</h1>
          <p className="mt-1 text-sm text-slate-400">Manage class assignments and homework</p>
        </div>
        <Button onClick={() => router.push('/assignments/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Create Assignment
        </Button>
      </div>
      <FilterBar
        placeholder="Search assignments..."
        onChange={(q) => setSearch(q)}
        onClear={() => { setSearch(''); setStatusFilter('') }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="" className="bg-slate-900 text-slate-200">All Status</option>
          <option value="draft" className="bg-slate-900 text-slate-200">Draft</option>
          <option value="published" className="bg-slate-900 text-slate-200">Published</option>
          <option value="closed" className="bg-slate-900 text-slate-200">Closed</option>
        </select>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (a) => <span className="font-medium">{a.title}</span> },
          { key: 'type', header: 'Type', cell: (a) => a.assignment_type },
          { key: 'max_score', header: 'Max Score', cell: (a) => a.max_score ?? '-' },
          { key: 'due_date', header: 'Due Date', cell: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '-' },
          { key: 'status', header: 'Status', cell: (a) => <StatusBadge status={a.status} /> },
          { key: 'actions', header: '', cell: (a) => (
            <RowActions onEdit={() => router.push(`/assignments/${a.id}`)} />
          )},
        ]}
        data={filteredAssignments}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load assignments"
        onRetry={refetch}
        emptyTitle="No assignments yet"
        emptyMessage="Get started by creating your first assignment."
      />
    </div>
  )
}
