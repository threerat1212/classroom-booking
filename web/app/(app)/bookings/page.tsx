'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle, Eye, Pencil, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/shared/data-table'
import { StatusBadge } from '@/components/shared/status-badge'
import { FilterBar, FilterSelect } from '@/components/shared/filter-bar'
import { approveBooking, deleteBooking, listBookings, type Booking } from '@/lib/api/bookings'
import { bookingKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { useLanguage } from '@/lib/context/language-context'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

function useBookings() {
  return useQuery({
    queryKey: bookingKeys.lists(),
    queryFn: async () => {
      const res = await listBookings()
      return res.data || []
    },
  })
}

export default function BookingsPage() {
  const router = useRouter()
  const qc = useQueryClient()
  const { user } = useCurrentUser()
  const { t } = useLanguage()
  const { data: bookings, isLoading, error, refetch } = useBookings()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const isAdmin = user?.role === 'admin'

  const approveMutation = useMutation({
    mutationFn: approveBooking,
    onSuccess: () => {
      toast.success('อนุมัติการจองสำเร็จ')
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: deleteBooking,
    onSuccess: () => {
      toast.success('ลบการจองสำเร็จ')
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const handleApprove = (booking: Booking) => {
    if (!confirm(`อนุมัติการจอง "${booking.title}"?`)) return
    approveMutation.mutate(booking.id)
  }

  const handleDelete = (booking: Booking) => {
    if (!confirm(`ลบการจอง "${booking.title}"? ไม่สามารถย้อนกลับได้`)) return
    deleteMutation.mutate(booking.id)
  }

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
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{t('bookings_title')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('bookings_subtitle')}</p>
        </div>
        <Button
          variant="brand"
          onClick={() => router.push('/bookings/new')}
          leftIcon={<Plus className="h-4 w-4" />}
          className="self-start sm:self-auto"
        >
          {t('bookings_add')}
        </Button>
      </div>
      <FilterBar
        placeholder={t('bookings_search')}
        onChange={(q) => setSearch(q)}
        onClear={() => { setSearch(''); setStatusFilter('') }}
      >
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label={t('all_status')}
        >
          <option value="">{t('all_status')}</option>
          <option value="pending">{t('status_pending')}</option>
          <option value="approved">{t('status_approved')}</option>
          <option value="rejected">{t('status_rejected')}</option>
          <option value="cancelled">{t('status_cancelled')}</option>
        </FilterSelect>
      </FilterBar>
      <DataTable
        columns={[
          { key: 'title', header: 'Title', cell: (b) => <span className="font-medium">{b.title}</span> },
          { key: 'purpose', header: 'Purpose', cell: (b) => b.purpose },
          { key: 'start', header: 'Start', cell: (b) => new Date(b.start_time).toLocaleString() },
          { key: 'end', header: 'End', cell: (b) => new Date(b.end_time).toLocaleString() },
          { key: 'status', header: 'Status', cell: (b) => <StatusBadge status={b.status} /> },
          { key: 'actions', header: '', cell: (b) => (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                onClick={() => router.push(`/bookings/${b.id}`)}
                aria-label={`View ${b.title}`}
                title={t('view')}
              >
                <Eye className="h-4 w-4" />
              </Button>
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                  onClick={() => router.push(`/bookings/${b.id}/edit`)}
                  aria-label={`Edit ${b.title}`}
                  title={t('edit')}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
              {isAdmin && b.status === 'pending' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                  onClick={() => handleApprove(b)}
                  disabled={approveMutation.isPending}
                  aria-label={`Approve ${b.title}`}
                  title={t('confirm')}
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              )}
              {isAdmin && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-700"
                  onClick={() => handleDelete(b)}
                  disabled={deleteMutation.isPending}
                  aria-label={`Delete ${b.title}`}
                  title={t('delete')}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          )},
        ]}
        data={filteredBookings}
        isLoading={isLoading}
        isError={!!error}
        errorMessage="ไม่สามารถโหลดข้อมูลการจองได้"
        onRetry={refetch}
        emptyTitle={t('bookings_empty_title')}
        emptyMessage={t('bookings_empty_message')}
      />
    </div>
  )
}
