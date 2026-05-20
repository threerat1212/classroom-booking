import { apiFetch } from '@/lib/http/client'

export interface Comment {
  id: string
  assignment_id: string
  parent_id?: string
  author_id: string
  author_name: string
  author_role: string
  content: string
  is_edited: boolean
  edited_at?: string
  created_at: string
  updated_at: string
}

export function listComments(assignmentId: string) {
  return apiFetch<{ data: Comment[] }>(`/api/v1/assignments/${assignmentId}/comments`)
}

export function createComment(assignmentId: string, content: string, parentId?: string) {
  return apiFetch<{ data: Comment }>(`/api/v1/assignments/${assignmentId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content, parent_id: parentId }),
  })
}

export function updateComment(commentId: string, content: string) {
  return apiFetch<{ data: Comment }>(`/api/v1/comments/${commentId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  })
}

export function deleteComment(commentId: string) {
  return apiFetch<void>(`/api/v1/comments/${commentId}`, {
    method: 'DELETE',
  })
}
