'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Trash2, Edit2, X, Check, CornerDownRight, Send, MessageSquare, Calendar, Award, MapPin, AlignLeft, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { downloadAssignmentGradebook, getAssignment, deleteAssignment, listAssignmentGradebook } from '@/lib/api/assignments'
import { gradeSubmission } from '@/lib/api/submissions'
import { listComments, createComment, updateComment, deleteComment } from '@/lib/api/comments'
import { assignmentKeys } from '@/lib/query/keys'
import { apiErrorMessage } from '@/lib/http/client'
import { useCurrentUser } from '@/hooks/useCurrentUser'
import { toast } from 'sonner'

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

  const { user } = useCurrentUser()
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingText, setEditingText] = useState('')
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')

  const { data: commentList = [], isLoading: isLoadingComments } = useQuery({
    queryKey: ['assignment-comments', id],
    queryFn: async () => (await listComments(id)).data ?? [],
    enabled: !!id,
  })

  const createCommentMutation = useMutation({
    mutationFn: ({ content, parentId }: { content: string; parentId?: string }) =>
      createComment(id, content, parentId),
    onSuccess: () => {
      setNewComment('')
      setReplyText('')
      setReplyingToId(null)
      qc.invalidateQueries({ queryKey: ['assignment-comments', id] })
      toast.success('Comment added')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      setEditingCommentId(null)
      setEditingText('')
      qc.invalidateQueries({ queryKey: ['assignment-comments', id] })
      toast.success('Comment updated')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => deleteComment(commentId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignment-comments', id] })
      toast.success('Comment deleted')
    },
    onError: (err) => toast.error(apiErrorMessage(err)),
  })

  const handleAddComment = () => {
    if (!newComment.trim() || createCommentMutation.isPending) return
    createCommentMutation.mutate({ content: newComment.trim() })
  }

  const handleAddReply = (parentId: string) => {
    if (!replyText.trim() || createCommentMutation.isPending) return
    createCommentMutation.mutate({ content: replyText.trim(), parentId })
  }

  const handleDeleteComment = (commentId: string) => {
    if (!confirm('Are you sure you want to delete this comment?')) return
    deleteCommentMutation.mutate(commentId)
  }

  const handleSaveEdit = (commentId: string) => {
    if (!editingText.trim() || updateCommentMutation.isPending) return
    updateCommentMutation.mutate({ commentId, content: editingText.trim() })
  }

  const getReplies = (parentId: string) => commentList.filter((c: any) => c.parent_id === parentId)
  const rootComments = commentList.filter((c: any) => !c.parent_id)

  const renderCommentItem = (c: any, isReply = false) => {
    const isEditing = editingCommentId === c.id
    const isReplying = replyingToId === c.id
    const isAuthor = user?.id === c.author_id
    const canDelete = isAuthor || role === 'teacher' || role === 'admin'

    return (
      <div key={c.id} className={`flex gap-3 ${isReply ? 'ml-8 mt-3 border-l-2 border-white/5 pl-3' : 'border-b border-white/5 pb-4'}`}>
        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-medium ${
          c.author_role === 'teacher' || c.author_role === 'admin'
            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
            : 'bg-blue-500/20 text-blue-400'
        }`}>
          {c.author_name.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">{c.author_name}</span>
              {(c.author_role === 'teacher' || c.author_role === 'admin') && (
                <Badge variant="outline" className="h-5 px-1.5 text-[10px] uppercase text-amber-400 border-amber-500/30 bg-amber-500/10">
                  {c.author_role}
                </Badge>
              )}
              <span className="text-[11px] text-slate-500">
                {new Date(c.created_at).toLocaleString()}
              </span>
              {c.is_edited && (
                <span className="text-[10px] text-slate-500 italic">(edited)</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!isEditing && isAuthor && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={() => {
                    setEditingCommentId(c.id)
                    setEditingText(c.content)
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
              {canDelete && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-slate-400 hover:text-red-400"
                  onClick={() => handleDeleteComment(c.id)}
                  disabled={deleteCommentMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="mt-1 flex flex-col gap-2">
              <Textarea
                value={editingText}
                onChange={(e) => setEditingText(e.target.value)}
                className="min-h-[60px] text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingCommentId(null)}
                  className="h-8 text-xs text-slate-400"
                >
                  <X className="mr-1 h-3 w-3" /> Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleSaveEdit(c.id)}
                  className="h-8 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={updateCommentMutation.isPending || !editingText.trim()}
                >
                  <Check className="mr-1 h-3 w-3" /> Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{c.content}</p>
          )}

          {!isEditing && !isReply && !isReplying && (
            <button
              onClick={() => {
                setReplyingToId(c.id)
                setReplyText('')
              }}
              className="mt-1 flex items-center gap-1 text-[11px] font-medium text-blue-400 hover:text-blue-300"
            >
              Reply
            </button>
          )}

          {isReplying && (
            <div className="mt-2 flex flex-col gap-2 rounded-lg border border-white/5 bg-slate-900/40 p-2.5">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <CornerDownRight className="h-3.5 w-3.5 text-blue-400" />
                Replying to {c.author_name}
              </div>
              <Textarea
                placeholder="Write a reply..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[50px] text-xs bg-slate-950/60"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setReplyingToId(null)}
                  className="h-7 text-[10px] text-slate-400"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleAddReply(c.id)}
                  className="h-7 text-[10px] bg-blue-600 hover:bg-blue-500 text-white"
                  disabled={createCommentMutation.isPending || !replyText.trim()}
                >
                  Reply
                </Button>
              </div>
            </div>
          )}

          {!isReply && getReplies(c.id).map(reply => renderCommentItem(reply, true))}
        </div>
      </div>
    )
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
              {isLoadingComments ? (
                <div className="py-4 text-center text-slate-400">
                  <Loader2 className="mx-auto h-5 w-5 animate-spin text-blue-400" />
                </div>
              ) : rootComments.length === 0 ? (
                <p className="text-sm text-slate-400">No comments yet. Start the discussion below.</p>
              ) : (
                <div className="space-y-4">
                  {rootComments.map((c) => renderCommentItem(c))}
                </div>
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
                  disabled={!newComment.trim() || createCommentMutation.isPending}
                >
                  {createCommentMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
