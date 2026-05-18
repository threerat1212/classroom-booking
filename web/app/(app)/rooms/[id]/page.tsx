'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Pencil, Save, X, DoorOpen, Building2, Home, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'
import { getRoom, updateRoom, deleteRoom } from '@/lib/api/rooms'
import { roomSchema, type RoomInput } from '@/lib/schemas/room'
import { roomKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { toast } from 'sonner'

const ROOM_TYPES = [
  { value: 'classroom', label: 'Classroom' },
  { value: 'meeting_room', label: 'Meeting Room' },
  { value: 'lab', label: 'Lab' },
  { value: 'auditorium', label: 'Auditorium' },
  { value: 'other', label: 'Other' },
] as const

const STATUSES = [
  { value: 'available', label: 'Available' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'closed', label: 'Closed' },
] as const

export default function RoomDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const [isEditing, setIsEditing] = useState(false)
  const qc = useQueryClient()

  const { data: room, isLoading } = useQuery({
    queryKey: roomKeys.detail(id),
    queryFn: () => getRoom(id),
    enabled: !!id,
  })

  const form = useForm<RoomInput>({
    resolver: zodResolver(roomSchema),
    values: room
      ? {
          name: room.data.name,
          code: room.data.code,
          room_type: room.data.room_type as RoomInput['room_type'],
          capacity: room.data.capacity,
          floor: room.data.floor,
          building: room.data.building ?? '',
          description: room.data.description ?? '',
          status: room.data.status as RoomInput['status'],
        }
      : undefined,
  })

  const updateMutation = useMutation({
    mutationFn: (data: RoomInput) => updateRoom(id, data),
    onSuccess: () => {
      toast.success('Room updated successfully')
      qc.invalidateQueries({ queryKey: roomKeys.detail(id) })
      qc.invalidateQueries({ queryKey: roomKeys.lists() })
      setIsEditing(false)
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteRoom(id),
    onSuccess: () => {
      toast.success('Room deleted')
      qc.invalidateQueries({ queryKey: roomKeys.lists() })
      router.push('/rooms')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const onSubmit = (data: RoomInput) => {
    updateMutation.mutate(data)
  }

  const handleDelete = () => {
    if (!confirm('Are you sure? This action cannot be undone.')) return
    deleteMutation.mutate()
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-64 animate-pulse rounded bg-gray-200" />
      </div>
    )
  }

  if (!room) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/rooms')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-slate-400">Room not found.</p>
      </div>
    )
  }

  const roomData = room.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/rooms')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">{roomData.name}</h1>
          <Badge variant={roomData.status === 'available' ? 'default' : 'secondary'}>
            {roomData.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
                {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
              <Button size="sm" onClick={form.handleSubmit(onSubmit)} disabled={updateMutation.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateMutation.isPending ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {!isEditing ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Room Details</h2>
              <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-slate-400">Code</dt>
                  <dd className="mt-1 text-sm text-white">{roomData.code}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Type</dt>
                  <dd className="mt-1 text-sm text-white capitalize">{roomData.room_type.replace('_', ' ')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Capacity</dt>
                  <dd className="mt-1 text-sm text-white">{roomData.capacity} people</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Building</dt>
                  <dd className="mt-1 text-sm text-white">{roomData.building || '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Floor</dt>
                  <dd className="mt-1 text-sm text-white">{roomData.floor ?? '-'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Description</dt>
                  <dd className="mt-1 text-sm text-white">{roomData.description || '-'}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <h2 className="text-lg font-semibold text-white">Floor Plan</h2>
              <div className="mt-4 space-y-3">
                <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <Building2 className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-400">Building</p>
                    <p className="text-sm font-medium text-white">{roomData.building || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <Home className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-400">Floor</p>
                    <p className="text-sm font-medium text-white">{roomData.floor ?? 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <DoorOpen className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-400">Room</p>
                    <p className="text-sm font-medium text-white">{roomData.name} ({roomData.code})</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">
                  <Users className="h-5 w-5 text-slate-500" />
                  <div>
                    <p className="text-xs text-slate-400">Capacity</p>
                    <p className="text-sm font-medium text-white">{roomData.capacity} people</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-xl">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Room name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Room code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="room_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select room type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROOM_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>
                            {t.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Capacity</FormLabel>
                      <FormControl>
                        <Input type="number" min={1} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="floor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Floor</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="building"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Building</FormLabel>
                    <FormControl>
                      <Input placeholder="Building name" {...field} />
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
                      <Textarea placeholder="Room description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
      )}
    </div>
  )
}
