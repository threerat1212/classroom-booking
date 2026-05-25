'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { RowActions } from '@/components/shared/row-actions'
import { FilterBar, FilterSelect } from '@/components/shared/filter-bar'
import { apiFetch, apiErrorMessage } from '@/lib/http/client'
import { useQuery } from '@tanstack/react-query'
import { roomKeys } from '@/lib/query/keys'
import { useLanguage } from '@/lib/context/language-context'

interface Room {
  id: string
  name: string
  code: string
  room_type: string
  capacity: number
  status: string
  building?: string
  floor?: number
}

function useRooms() {
  return useQuery({
    queryKey: roomKeys.lists(),
    queryFn: async () => {
      const res = await apiFetch<{ data: Room[] | null }>('/api/v1/rooms')
      return res.data || []
    },
  })
}

export default function RoomsPage() {
  const router = useRouter()
  const { t } = useLanguage()
  const { data: rooms, isLoading, error, refetch } = useRooms()
  const [, setDeleting] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const pageSize = 10

  const filteredRooms = useMemo(() => {
    if (!Array.isArray(rooms)) return []
    return rooms.filter((r) => {
      const matchesSearch = !search ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.code.toLowerCase().includes(search.toLowerCase()) ||
        r.building?.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [rooms, search, statusFilter])

  const handleDelete = async (id: string) => {
    if (!confirm('คุณแน่ใจหรือไม่? การลบนี้ไม่สามารถย้อนกลับได้')) return
    setDeleting(id)
    try {
      await apiFetch(`/api/v1/rooms/${id}`, { method: 'DELETE' })
      toast.success('ลบห้องสำเร็จ')
      refetch()
    } catch (err) {
      toast.error(apiErrorMessage(err))
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{t('rooms_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('rooms_subtitle')}</p>
        </div>
        <Button
          variant="brand"
          onClick={() => router.push('/rooms/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto"
        >
          {t('rooms_add')}
        </Button>
      </div>
      <FilterBar
        placeholder={t('rooms_search')}
        onChange={(q) => { setSearch(q); setPage(1) }}
        onClear={() => { setSearch(''); setStatusFilter(''); setPage(1) }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          aria-label={t('all_status')}
        >
          <option value="">{t('all_status')}</option>
          <option value="available">{t('status_available')}</option>
          <option value="maintenance">{t('status_maintenance')}</option>
          <option value="closed">{t('status_closed')}</option>
        </FilterSelect>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'name', header: 'Name', cell: (r) => <span className="font-medium text-slate-900">{r.name}</span> },
          { key: 'code', header: 'Code', cell: (r) => <span className="font-mono text-xs text-slate-600">{r.code}</span> },
          { key: 'type', header: 'Type', cell: (r) => r.room_type },
          { key: 'capacity', header: 'Capacity', cell: (r) => r.capacity },
          { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          { key: 'building', header: 'Building', cell: (r) => (r.building ? `${r.building} / Floor ${r.floor}` : '—') },
          { key: 'actions', header: '', cell: (r) => (
            <RowActions
              onEdit={() => router.push(`/rooms/${r.id}`)}
              onDelete={() => handleDelete(r.id)}
            />
          )},
        ]}
        data={filteredRooms}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="ไม่สามารถโหลดข้อมูลห้องได้"
        onRetry={refetch}
        emptyTitle={t('rooms_empty_title')}
        emptyMessage={t('rooms_empty_message')}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  )
}
