import { apiFetch } from '@/lib/http/client'

export interface LearningTitle {
  code: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  is_unique: boolean
  is_unlocked?: boolean
  is_equipped?: boolean
  awarded_at?: string
}

export interface LearningAchievement {
  code: string
  title_code?: string
  name: string
  description: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  trigger_type: string
  is_earned: boolean
  earned_at?: string
  title?: LearningTitle
}

export interface AchievementSummary {
  titles: LearningTitle[]
  achievements: LearningAchievement[]
  equipped_title?: LearningTitle
  special_quest_count: number
}

export function getMyAchievements() {
  return apiFetch<{ data: AchievementSummary }>('/api/v1/achievements/my')
}

export function listTitles() {
  return apiFetch<{ data: LearningTitle[] }>('/api/v1/achievements/titles')
}

export function equipTitle(code: string) {
  return apiFetch<{ data: { rank_title: string; title: LearningTitle } }>(`/api/v1/achievements/titles/${code}/equip`, {
    method: 'POST',
  })
}
