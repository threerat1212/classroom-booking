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

interface Booking {
  id: string
  room_id: string
  title: string
  purpose: string
  start_time: string
  end_time: string
  status: string
}

function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: async () => {
      const res = await apiFetch<{ data: Booking[] | null }>('/api/v1/bookings')
      return res.data || []
    },
  })
}

export default function BookingsPage() {
  const router = useRouter()
  const { data: bookings, isLoading, error, refetch } = useBookings()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredBookings = useMemo(() => {
    if (!bookings) return bookings
    return bookings.filter((b) => {
      const matchesSearch = !search ||
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.purpose.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = !statusFilter || b.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [bookings, search, statusFilter])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Bookings</h1>
          <p className="mt-1 text-sm text-slate-400">Manage room reservations</p>
        </div>
        <Button onClick={() => router.push('/bookings/new')} className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:from-blue-600 hover:to-indigo-700 shadow-lg shadow-blue-500/25">
          <Plus className="mr-2 h-4 w-4" />
          New Booking
        </Button>
      </div>
      <FilterBar
        placeholder="Search bookings..."
        onChange={(q) => setSearch(q)}
        onClear={() => { setSearch(''); setStatusFilter('') }}
      >
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-lg border border-white/10 bg-white/5 px-2 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
        >
          <option value="" className="bg-slate-900 text-slate-200">All Status</option>
          <option value="pending" className="bg-slate-900 text-slate-200">Pending</option>
          <option value="approved" className="bg-slate-900 text-slate-200">Approved</option>
          <option value="rejected" className="bg-slate-900 text-slate-200">Rejected</option>
          <option value="cancelled" className="bg-slate-900 text-slate-200">Cancelled</option>
        </select>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (b) => <span className="font-medium">{b.title}</span> },
          { key: 'purpose', header: 'Purpose', cell: (b) => b.purpose },
          { key: 'start', header: 'Start', cell: (b) => new Date(b.start_time).toLocaleString() },
          { key: 'end', header: 'End', cell: (b) => new Date(b.end_time).toLocaleString() },
          { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
          { key: 'actions', header: '', cell: (b) => (
            <RowActions onView={() => router.push(`/bookings/${b.id}`)} />
          )},
        ]}
        data={filteredBookings}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load bookings"
        onRetry={refetch}
        emptyTitle="No bookings yet"
        emptyMessage="Get started by creating your first booking."
      />
    </div>
  )
}
