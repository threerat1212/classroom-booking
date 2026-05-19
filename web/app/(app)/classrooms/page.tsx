'use client'

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpen, Copy, Loader2, Plus, Users } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { apiErrorMessage } from '@/lib/http/client'
import {
  Classroom,
  createClassroom,
  joinClassroom,
  listClassrooms,
} from '@/lib/api/classrooms'

function ClassroomCard({ classroom, canCopyCode }: { classroom: Classroom; canCopyCode: boolean }) {
  const copyCode = async () => {
    if (!classroom.join_code) return
    await navigator.clipboard.writeText(classroom.join_code)
    toast.success('Join code copied')
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-white">{classroom.name}</p>
          <p className="mt-0.5 text-xs text-slate-400">{classroom.code}</p>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-300">
          <Users className="h-3.5 w-3.5" />
          {classroom.student_count}
        </div>
      </div>

      {classroom.description && (
        <p className="mt-3 line-clamp-2 text-sm text-slate-300">{classroom.description}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-400">
        {classroom.teacher_name && <span>Teacher: {classroom.teacher_name}</span>}
        <span>Capacity: {classroom.capacity}</span>
      </div>

      {canCopyCode && classroom.join_code && (
        <button
          type="button"
          onClick={copyCode}
          className="mt-4 flex w-full items-center justify-between rounded-lg border border-white/10 bg-slate-950/40 px-3 py-2 text-left transition-colors hover:bg-white/10"
        >
          <span className="font-mono text-sm font-semibold tracking-wider text-white">{classroom.join_code}</span>
          <Copy className="h-4 w-4 text-slate-400" />
        </button>
      )}
    </div>
  )
}

export default function ClassroomsPage() {
  const queryClient = useQueryClient()
  const { role } = useCurrentUser()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [capacity, setCapacity] = useState('30')
  const [description, setDescription] = useState('')
  const [joinCode, setJoinCode] = useState('')

  const classroomsQuery = useQuery({
    queryKey: ['classrooms'],
    queryFn: listClassrooms,
  })

  const classrooms = classroomsQuery.data?.data ?? []
  const canCreate = role === 'teacher' || role === 'admin'
  const canJoin = role === 'student'

  const createMutation = useMutation({
    mutationFn: createClassroom,
    onSuccess: () => {
      toast.success('Classroom created')
      setName('')
      setCode('')
      setCapacity('30')
      setDescription('')
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const joinMutation = useMutation({
    mutationFn: joinClassroom,
    onSuccess: (res) => {
      toast.success(`Joined ${res.data.name}`)
      setJoinCode('')
      queryClient.invalidateQueries({ queryKey: ['classrooms'] })
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const handleCreate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    createMutation.mutate({
      name,
      code: code || undefined,
      capacity: Number(capacity) || 30,
      description: description || undefined,
    })
  }

  const handleJoin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    joinMutation.mutate(joinCode)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{canJoin ? 'My Classrooms' : 'Classrooms'}</h1>
        <p className="mt-1 text-sm text-slate-400">
          {canJoin ? 'Join classes and see the coursework from your teachers' : 'Create teaching rooms and share join codes with students'}
        </p>
      </div>

      {canCreate && (
        <form onSubmit={handleCreate} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-blue-400" />
            <h2 className="text-sm font-semibold text-white">Create Classroom</h2>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Classroom name" required />
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Class code (optional)" />
            <Input value={capacity} onChange={(e) => setCapacity(e.target.value)} type="number" min={1} placeholder="Capacity" />
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description (optional)"
              className="sm:col-span-2"
            />
          </div>
          <Button type="submit" className="mt-4" disabled={createMutation.isPending || !name.trim()}>
            {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
            Create Classroom
          </Button>
        </form>
      )}

      {canJoin && (
        <form onSubmit={handleJoin} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-emerald-400" />
            <h2 className="text-sm font-semibold text-white">Join Classroom</h2>
          </div>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Input
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="Enter join code"
              className="font-mono tracking-wider"
              required
            />
            <Button type="submit" disabled={joinMutation.isPending || !joinCode.trim()}>
              {joinMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Join
            </Button>
          </div>
        </form>
      )}

      {classroomsQuery.isLoading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-500" />
        </div>
      ) : classrooms.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center">
          <BookOpen className="mx-auto h-8 w-8 text-slate-600" />
          <p className="mt-3 text-sm font-medium text-white">No classrooms yet</p>
          <p className="mt-1 text-xs text-slate-500">
            {canJoin ? 'Ask your teacher for a join code.' : 'Create the first classroom for your students.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {classrooms.map((classroom) => (
            <ClassroomCard key={classroom.id} classroom={classroom} canCopyCode={canCreate} />
          ))}
        </div>
      )}
    </div>
  )
}
