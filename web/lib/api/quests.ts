import { apiFetch } from '@/lib/http/client'

export interface Quest {
  id: string
  title: string
  topic: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
  exp_reward: number
  gold_reward: number
  time_limit_minutes?: number
  is_completed?: boolean
  classroom_id?: string
  classroom_name?: string
  quest_kind?: 'standard' | 'special'
  required_title_code?: string
  required_title_name?: string
  unlock_note?: string
  is_locked?: boolean
  locked_reason?: string
  status?: string
}

export interface QuestDetail {
  id: string
  title: string
  topic: string
  difficulty: string
  question: string
  hints: string[]
  explanation?: string
  exp_reward: number
  gold_reward: number
  time_limit_minutes?: number
  quest_kind?: 'standard' | 'special'
  required_title_name?: string
  unlock_note?: string
  hint_tokens_available: number
}

export interface AttemptResult {
  is_correct: boolean
  score: number
  feedback: string
  exp_earned: number
  gold_earned: number
}

export interface QuestHintResult {
  hint: string
  hint_tokens_available: number
  redemption_id: string
  used_at: string
}

export interface CreateQuestInput {
  classroom_id?: string
  required_title_code?: string
  quest_kind?: 'standard' | 'special'
  difficulty: string
  title: string
  topic: string
  question: string
  answer: string
  hints?: string[]
  explanation?: string
  exp_reward: number
  gold_reward: number
  unlock_note?: string
}

export interface GenerateQuestInput {
  topic: string
  classroom_id: string
}

export async function listQuests() {
  const res = await apiFetch<{ data: Quest[] }>('/api/v1/quests')
  return res.data
}

export async function getQuest(id: string) {
  const res = await apiFetch<{ data: QuestDetail }>(`/api/v1/quests/${id}`)
  return res.data
}

export async function createQuest(input: CreateQuestInput) {
  const res = await apiFetch<{ data: Quest }>('/api/v1/quests', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function generateQuests(input: GenerateQuestInput) {
  const res = await apiFetch<{ data: Quest[] }>('/api/v1/quests/generate', {
    method: 'POST',
    body: JSON.stringify(input),
  })
  return res.data
}

export async function submitQuestAnswer(questId: string, answer: string) {
  const res = await apiFetch<{ data: AttemptResult }>('/api/v1/quests/submit', {
    method: 'POST',
    body: JSON.stringify({ quest_id: questId, answer: answer.trim() }),
  })
  return res.data
}

export async function useQuestHintToken(questId: string) {
  const res = await apiFetch<{ data: QuestHintResult }>(`/api/v1/quests/${questId}/use-hint-token`, {
    method: 'POST',
  })
  return res.data
}
