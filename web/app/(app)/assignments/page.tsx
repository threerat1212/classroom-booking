'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { RowActions } from '@/components/shared/row-actions'
import { FilterBar, FilterSelect } from '@/components/shared/filter-bar'
import { apiFetch } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { useLanguage } from '@/lib/context/language-context'

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
  const { t } = useLanguage()
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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{t('assignments_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('assignments_subtitle')}</p>
        </div>
        <Button
          variant="brand"
          onClick={() => router.push('/assignments/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto"
        >
          {t('assignments_add')}
        </Button>
      </div>
      <FilterBar
        placeholder={t('assignments_search')}
        onChange={(q) => setSearch(q)}
        onClear={() => { setSearch(''); setStatusFilter('') }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label={t('all_status')}
        >
          <option value="">{t('all_status')}</option>
          <option value="draft">{t('status_draft')}</option>
          <option value="published">{t('status_published')}</option>
          <option value="closed">{t('status_closed')}</option>
        </FilterSelect>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (a) => <span className="font-medium text-slate-900">{a.title}</span> },
          { key: 'type', header: 'Type', cell: (a) => a.assignment_type },
          { key: 'max_score', header: 'Max Score', cell: (a) => a.max_score ?? '—' },
          { key: 'due_date', header: 'Due Date', cell: (a) => a.due_date ? new Date(a.due_date).toLocaleDateString() : '—' },
          { key: 'status', header: 'Status', cell: (a) => <StatusBadge status={a.status} /> },
          { key: 'actions', header: '', cell: (a) => (
            <RowActions onEdit={() => router.push(`/assignments/${a.id}`)} />
          )},
        ]}
        data={filteredAssignments}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="ไม่สามารถโหลดข้อมูลงานได้"
        onRetry={refetch}
        emptyTitle={t('assignments_empty_title')}
        emptyMessage={t('assignments_empty_message')}
      />
    </div>
  )
}
