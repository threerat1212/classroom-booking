import { apiFetch } from '@/lib/http/client'

export interface LevelUnlock {
  level: number
  title: string
  description: string
  category: string
  unlocked: boolean
}

export interface LevelProgress {
  level: number
  xp: number
  rank_title: string
  current_level_xp: number
  next_level_xp: number
  unlocks: LevelUnlock[]
}

export function getLevelProgress() {
  return apiFetch<{ data: LevelProgress }>('/api/v1/unlocks')
}
