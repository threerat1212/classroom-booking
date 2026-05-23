'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, CheckCircle, XCircle, MapPin, Calendar, AlignLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { getBooking, approveBooking, rejectBooking, deleteBooking } from '@/lib/api/bookings'
import { bookingKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { toast } from 'sonner'
import { useCurrentUser } from '@/hooks/useCurrentUser'

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500 text-yellow-100',
  approved: 'bg-green-500 text-green-100',
  rejected: 'bg-red-500 text-red-100',
  cancelled: 'bg-white/50 text-slate-500',
}

export default function BookingDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const qc = useQueryClient()
  const { user } = useCurrentUser()
  const isAdmin = user?.role === 'admin'
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const { data: booking, isLoading } = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
  })

  const approveMutation = useMutation({
    mutationFn: () => approveBooking(id),
    onSuccess: () => {
      toast.success('Booking approved')
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const rejectMutation = useMutation({
    mutationFn: () => rejectBooking(id, rejectReason),
    onSuccess: () => {
      toast.success('Booking rejected')
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
      setShowRejectInput(false)
      setRejectReason('')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteBooking(id),
    onSuccess: () => {
      toast.success('Booking deleted')
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
      router.push('/bookings')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-slate-400">Booking not found.</p>
      </div>
    )
  }

  const b = booking.data
  const canAct = isAdmin && b.status === 'pending'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/bookings')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">{b.title}</h1>
          <Badge className={statusColors[b.status] || 'bg-white/50 text-slate-500'}>
            {b.status}
          </Badge>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.push(`/bookings/${id}/edit`)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" size="sm" onClick={() => {
              if (!confirm('Are you sure? This action cannot be undone.')) return
              deleteMutation.mutate()
            }} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Booking Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <AlignLeft className="h-4 w-4" />
                  Purpose
                </dt>
                <dd className="mt-1 text-sm text-white capitalize">{b.purpose}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <MapPin className="h-4 w-4" />
                  Room
                </dt>
                <dd className="mt-1 text-sm text-white">{b.room_id}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Start
                </dt>
                <dd className="mt-1 text-sm text-white">{new Date(b.start_time).toLocaleString()}</dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Calendar className="h-4 w-4" />
                  End
                </dt>
                <dd className="mt-1 text-sm text-white">{new Date(b.end_time).toLocaleString()}</dd>
              </div>
              {b.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-400">Description</dt>
                  <dd className="mt-1 text-sm text-white">{b.description}</dd>
                </div>
              )}
              {b.rejection_reason && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-400">Rejection Reason</dt>
                  <dd className="mt-1 text-sm text-red-600">{b.rejection_reason}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {canAct && (
          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Actions</h2>
              <div className="mt-4 space-y-3">
                <Button
                  className="w-full"
                  onClick={() => approveMutation.mutate()}
                  disabled={approveMutation.isPending}
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {approveMutation.isPending ? 'Approving...' : 'Approve'}
                </Button>

                {!showRejectInput ? (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setShowRejectInput(true)}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Reject
                  </Button>
                ) : (
                  <div className="space-y-2">
                    <Input
                      placeholder="Rejection reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowRejectInput(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={() => rejectMutation.mutate()}
                        disabled={rejectMutation.isPending || !rejectReason}
                      >
                        {rejectMutation.isPending ? 'Rejecting...' : 'Reject'}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
