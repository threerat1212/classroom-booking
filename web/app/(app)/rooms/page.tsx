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
import { roomKeys } from '@/lib/query/keys'

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
  const { data: rooms, isLoading, error, refetch } = useRooms()
  const [deleting, setDeleting] = useState<string | null>(null)
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
    if (!confirm('Are you sure? This action cannot be undone.')) return
    setDeleting(id)
    try {
      await apiFetch(`/api/v1/rooms/${id}`, { method: 'DELETE' })
      refetch()
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rooms</h1>
          <p className="mt-1 text-sm text-slate-400">Manage classrooms and meeting rooms</p>
        </div>
        <Button onClick={() => router.push('/rooms/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
          <Plus className="mr-2 h-4 w-4" />
          Add Room
        </Button>
      </div>
      <FilterBar
        placeholder="Search rooms..."
        onChange={(q) => { setSearch(q); setPage(1) }}
        onClear={() => { setSearch(''); setStatusFilter(''); setPage(1) }}
      >
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="" className="bg-slate-900 text-slate-200">All Status</option>
          <option value="available" className="bg-slate-900 text-slate-200">Available</option>
          <option value="maintenance" className="bg-slate-900 text-slate-200">Maintenance</option>
          <option value="closed" className="bg-slate-900 text-slate-200">Closed</option>
        </select>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'name', header: 'Name', cell: (r) => <span className="font-medium">{r.name}</span> },
          { key: 'code', header: 'Code', cell: (r) => r.code },
          { key: 'type', header: 'Type', cell: (r) => r.room_type },
          { key: 'capacity', header: 'Capacity', cell: (r) => r.capacity },
          { key: 'status', header: 'Status', cell: (r) => <StatusBadge status={r.status} /> },
          { key: 'building', header: 'Building', cell: (r) => (r.building ? `${r.building} / Floor ${r.floor}` : '-') },
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
        errorMessage="Failed to load rooms"
        onRetry={refetch}
        emptyTitle="No rooms yet"
        emptyMessage="Get started by adding your first room."
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
      />
    </div>
  )
}
