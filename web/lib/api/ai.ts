import { apiFetch } from '@/lib/http/client'

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  created_at: string
}

export interface ChatResponse {
  session_id: string
  message: string
}

export async function sendChatMessage(message: string, sessionId?: string | null) {
  const body: Record<string, string> = { message }
  if (sessionId) body.session_id = sessionId

  const res = await apiFetch<{ data: ChatResponse }>('/api/v1/ai/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  })
  return res.data
}

export async function listChatSessions() {
  const res = await apiFetch<{ data: { id: string; title: string; created_at: string }[] }>('/api/v1/ai/chat/sessions')
  return res.data
}

export async function listChatMessages(sessionId: string) {
  const res = await apiFetch<{ data: ChatMessage[] }>(`/api/v1/ai/chat/sessions/${sessionId}/messages`)
  return res.data
}
