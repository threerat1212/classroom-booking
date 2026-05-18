'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Send, MessageSquare, Calendar, Award, MapPin, AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { getAssignment, deleteAssignment } from '@/lib/api/assignments'
import { assignmentKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { toast } from 'sonner'

interface Comment {
  id: string
  author: string
  text: string
  createdAt: string
}

export default function AssignmentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string
  const qc = useQueryClient()

  const { data: assignment, isLoading } = useQuery({
    queryKey: assignmentKeys.detail(id),
    queryFn: () => getAssignment(id),
    enabled: !!id,
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteAssignment(id),
    onSuccess: () => {
      toast.success('Assignment deleted')
      qc.invalidateQueries({ queryKey: assignmentKeys.lists() })
      router.push('/assignments')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')

  const handleAddComment = () => {
    if (!newComment.trim()) return
    const comment: Comment = {
      id: Math.random().toString(36).slice(2),
      author: 'Current User',
      text: newComment.trim(),
      createdAt: new Date().toISOString(),
    }
    setComments((prev) => [...prev, comment])
    setNewComment('')
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded bg-white/50" />
        <div className="h-64 animate-pulse rounded bg-white/50" />
      </div>
    )
  }

  if (!assignment) {
    return (
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.push('/assignments')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <p className="text-slate-400">Assignment not found.</p>
      </div>
    )
  }

  const a = assignment.data

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => router.push('/assignments')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-white">{a.title}</h1>
          <Badge variant={a.status === 'active' ? 'default' : 'secondary'}>{a.status}</Badge>
        </div>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            if (!confirm('Are you sure? This action cannot be undone.')) return
            deleteMutation.mutate()
          }}
          disabled={deleteMutation.isPending}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-semibold text-white">Assignment Details</h2>
            <dl className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <AlignLeft className="h-4 w-4" />
                  Type
                </dt>
                <dd className="mt-1 text-sm text-white capitalize">{a.assignment_type}</dd>
              </div>
              {a.max_score !== undefined && (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <Award className="h-4 w-4" />
                    Max Score
                  </dt>
                  <dd className="mt-1 text-sm text-white">{a.max_score}</dd>
                </div>
              )}
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <Calendar className="h-4 w-4" />
                  Due Date
                </dt>
                <dd className="mt-1 text-sm text-white">
                  {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'No due date'}
                </dd>
              </div>
              {a.room_id && (
                <div>
                  <dt className="flex items-center gap-2 text-sm font-medium text-slate-400">
                    <MapPin className="h-4 w-4" />
                    Room
                  </dt>
                  <dd className="mt-1 text-sm text-white">{a.room_id}</dd>
                </div>
              )}
              {a.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-slate-400">Description</dt>
                  <dd className="mt-1 text-sm whitespace-pre-wrap text-white">{a.description}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-6">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <MessageSquare className="h-5 w-5" />
              Discussion
            </h2>
            <div className="mt-4 space-y-4">
              {comments.length === 0 ? (
                <p className="text-sm text-slate-400">No comments yet. Start the discussion below.</p>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-medium text-blue-400">
                      {c.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{c.author}</span>
                        <span className="text-xs text-slate-500">
                          {new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-300">{c.text}</p>
                    </div>
                  </div>
                ))
              )}

              <div className="flex gap-2 pt-2">
                <Textarea
                  placeholder="Write a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[60px] flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleAddComment()
                    }
                  }}
                />
                <Button
                  size="icon"
                  className="shrink-0"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
