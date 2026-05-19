'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Send, MessageSquare, Calendar, Award, MapPin, AlignLeft, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { downloadAssignmentGradebook, getAssignment, deleteAssignment, listAssignmentGradebook } from '@/lib/api/assignments'
import { gradeSubmission } from '@/lib/api/submissions'
import { assignmentKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
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
  const { role } = useCurrentUser()
  const canGrade = role === 'teacher' || role === 'admin'
  const [scoreDrafts, setScoreDrafts] = useState<Record<string, string>>({})
  const [feedbackDrafts, setFeedbackDrafts] = useState<Record<string, string>>({})
  const [gradeCodeDrafts, setGradeCodeDrafts] = useState<Record<string, string>>({})

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

  const gradebookQuery = useQuery({
    queryKey: ['assignment-gradebook', id],
    queryFn: async () => (await listAssignmentGradebook(id)).data ?? [],
    enabled: !!id && canGrade,
  })

  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, score, feedback, gradeCode }: { submissionId: string; score: number; feedback?: string; gradeCode?: string }) =>
      gradeSubmission(submissionId, {
        score,
        feedback,
        grade_code: gradeCode || undefined,
      }),
    onSuccess: () => {
      toast.success('Score saved')
      qc.invalidateQueries({ queryKey: ['assignment-gradebook', id] })
      qc.invalidateQueries({ queryKey: ['grades'] })
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

  const handleExport = async () => {
    try {
      const blob = await downloadAssignmentGradebook(id)
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = `${assignment?.data?.title || 'assignment'}-gradebook.xlsx`
      anchor.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(apiErrorMessage(err))
    }
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

          {canGrade && (
            <div className="rounded-lg border border-white/10 bg-white/5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Gradebook</h2>
                  <p className="mt-1 text-sm text-slate-400">Assignment scores and final grade codes</p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export Excel
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr className="border-b border-white/10">
                      <th className="py-2 pr-3">Student</th>
                      <th className="py-2 pr-3">Status</th>
                      <th className="py-2 pr-3">Score</th>
                      <th className="py-2 pr-3">Grade</th>
                      <th className="py-2 pr-3">Feedback</th>
                      <th className="py-2 pr-3" />
                    </tr>
                  </thead>
                  <tbody>
                    {gradebookQuery.isLoading ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin" />
                        </td>
                      </tr>
                    ) : (gradebookQuery.data ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-400">No students or submissions yet</td>
                      </tr>
                    ) : (
                      (gradebookQuery.data ?? []).map((row) => {
                        const key = row.submission_id ?? row.student_id
                        const scoreValue = scoreDrafts[key] ?? (row.score?.toString() ?? '')
                        const feedbackValue = feedbackDrafts[key] ?? (row.feedback ?? '')
                        const gradeValue = gradeCodeDrafts[key] ?? row.grade_code
                        const canSave = !!row.submission_id && scoreValue !== ''
                        return (
                          <tr key={key} className="border-b border-white/5 align-top">
                            <td className="py-3 pr-3">
                              <p className="font-medium text-white">{row.student_name}</p>
                              <p className="text-xs text-slate-500">{row.student_email}</p>
                            </td>
                            <td className="py-3 pr-3 text-slate-300">{row.status}</td>
                            <td className="py-3 pr-3">
                              <Input
                                type="number"
                                min={0}
                                max={row.max_score}
                                value={scoreValue}
                                onChange={(event) => setScoreDrafts((prev) => ({ ...prev, [key]: event.target.value }))}
                                disabled={!row.submission_id}
                                className="h-9 w-24"
                              />
                              <p className="mt-1 text-xs text-slate-500">/ {row.max_score}</p>
                            </td>
                            <td className="py-3 pr-3">
                              <select
                                value={gradeValue}
                                onChange={(event) => setGradeCodeDrafts((prev) => ({ ...prev, [key]: event.target.value }))}
                                disabled={!row.submission_id}
                                className="h-9 rounded-md border border-white/10 bg-slate-950/60 px-2 text-sm text-white"
                              >
                                {['ร', '0', '1', '1.5', '2', '2.5', '3', '3.5', '4'].map((grade) => (
                                  <option key={grade} value={grade}>{grade}</option>
                                ))}
                              </select>
                            </td>
                            <td className="py-3 pr-3">
                              <Input
                                value={feedbackValue}
                                onChange={(event) => setFeedbackDrafts((prev) => ({ ...prev, [key]: event.target.value }))}
                                disabled={!row.submission_id}
                                placeholder="Feedback"
                                className="h-9 min-w-[180px]"
                              />
                            </td>
                            <td className="py-3 pr-3">
                              <Button
                                size="sm"
                                disabled={!canSave || gradeMutation.isPending}
                                onClick={() => row.submission_id && gradeMutation.mutate({
                                  submissionId: row.submission_id,
                                  score: Number(scoreValue),
                                  feedback: feedbackValue,
                                  gradeCode: gradeValue,
                                })}
                              >
                                Save
                              </Button>
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 rounded-lg border border-white/10 bg-slate-950/40 p-3 text-xs text-slate-400">
                ต่ำกว่า 50 = 0 หรือ ร, 50-54 = 1, 55-59 = 1.5, 60-64 = 2, 65-69 = 2.5, 70-74 = 3, 75-79 = 3.5, 80+ = 4
              </div>
            </div>
          )}

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
