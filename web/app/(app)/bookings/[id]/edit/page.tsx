'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { DateTimePicker } from '@/components/ui/date-time-picker'
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getBooking, updateBooking } from '@/lib/api/bookings'
import { listRooms } from '@/lib/api/rooms'
import { bookingKeys, roomKeys } from '@/lib/query/keys'
import { bookingSchema, type BookingInput } from '@/lib/schemas/booking'
import { apiErrorMessage } from '@/lib/http/client'
import { toast } from 'sonner'

const PURPOSES = [
  { value: 'class', label: 'Class' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'exam', label: 'Exam' },
  { value: 'event', label: 'Event' },
  { value: 'other', label: 'Other' },
] as const

function toPickerValue(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${year}-${month}-${day}T${hours}:${minutes}`
}

export default function EditBookingPage() {
  const router = useRouter()
  const params = useParams()
  const qc = useQueryClient()
  const id = params.id as string

  const form = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      room_id: '',
      title: '',
      description: '',
      purpose: 'meeting',
      start_time: '',
      end_time: '',
    },
  })

  const { data: rooms } = useQuery({
    queryKey: roomKeys.lists(),
    queryFn: listRooms,
  })

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
    enabled: !!id,
  })

  useEffect(() => {
    const b = booking?.data
    if (!b) return

    form.reset({
      room_id: b.room_id,
      title: b.title,
      description: b.description || '',
      purpose: b.purpose as BookingInput['purpose'],
      start_time: toPickerValue(b.start_time),
      end_time: toPickerValue(b.end_time),
    })
    form.setValue('room_id', b.room_id, { shouldDirty: false, shouldValidate: false })
  }, [booking, form])

  const mutation = useMutation({
    mutationFn: (data: BookingInput) => updateBooking(id, data),
    onSuccess: () => {
      toast.success('Booking updated')
      qc.invalidateQueries({ queryKey: bookingKeys.detail(id) })
      qc.invalidateQueries({ queryKey: bookingKeys.lists() })
      router.push(`/bookings/${id}`)
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const onSubmit = (data: BookingInput) => {
    mutation.mutate(data)
  }

  if (isLoading) {
    return (
      <div className="max-w-lg space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-white/10" />
        <div className="h-96 animate-pulse rounded-lg bg-white/10" />
      </div>
    )
  }

  if (isError || !booking) {
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

  return (
    <div className="max-w-lg space-y-6">
      <div className="flex items-start gap-3">
        <Button variant="outline" size="sm" onClick={() => router.push(`/bookings/${id}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Booking</h1>
          <p className="mt-1 text-sm text-slate-400">Update room, time, and booking details</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="room_id"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Room</FormLabel>
                <FormControl>
                  <select
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  >
                    <option value="">Select a room</option>
                    {rooms?.data.map((room) => (
                      <option key={room.id} value={room.id}>
                        {room.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Booking title" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input placeholder="Optional description" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {PURPOSES.map((purpose) => (
                      <SelectItem key={purpose.value} value={purpose.value}>
                        {purpose.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="start_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <DateTimePicker
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.push(`/bookings/${id}`)}>
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}
