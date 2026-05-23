import { apiFetch } from '@/lib/http/client'
import { Classroom } from '@/lib/api/classrooms'

export interface GradeOption {
  code: string
  display: string
}

export interface CommunityDashboardStats {
  student_count: number
  classroom_count: number
  rare_badge_count: number
  quest_clear_count: number
}

export interface CommunityAchievementEvent {
  type: string
  student_id: string
  student_name: string
  classroom_id?: string
  classroom_name?: string
  title: string
  description: string
  rarity: string
  occurred_at: string
}

export interface CommunityTopRoom {
  classroom_id: string
  classroom_name: string
  grade_level?: string
  class_section?: string
  student_count: number
  total_xp: number
  recent_achievement_count: number
}

export interface CommunityRareHighlight {
  code: string
  name: string
  rarity: string
  earned_count: number
}

export interface CommunityClassroomCard {
  classroom_id: string
  name: string
  code: string
  grade_level?: string
  class_section?: string
  student_count: number
  is_primary: boolean
}

export interface CommunityStudentHighlight {
  student_id: string
  full_name: string
  xp: number
  level: number
  rank_title?: string
}

export interface CommunityDashboard {
  selected_grade: string
  selected_grade_label: string
  accessible_grades: GradeOption[]
  primary_classroom_id?: string
  stats: CommunityDashboardStats
  feed: CommunityAchievementEvent[]
  top_rooms: CommunityTopRoom[]
  rare_highlights: CommunityRareHighlight[]
  classrooms: CommunityClassroomCard[]
  weekly_highlight?: CommunityStudentHighlight
}

export interface ClassroomLeaderboardEntry {
  rank: number
  student_id: string
  full_name: string
  xp: number
  level: number
  rank_title?: string
}

export interface ClassroomBadgeWallItem {
  student_id: string
  student_name: string
  code: string
  name: string
  description: string
  rarity: string
  earned_at: string
}

export interface ClassroomQuestProgress {
  active_quest_count: number
  completed_count: number
  participant_count: number
  completion_percent: number
}

export interface ClassroomDashboard {
  classroom: Classroom
  leaderboard: ClassroomLeaderboardEntry[]
  badge_wall: ClassroomBadgeWallItem[]
  quest_progress: ClassroomQuestProgress
  recent_moments: CommunityAchievementEvent[]
}

export function getCommunityDashboard(gradeLevel?: string) {
  const query = gradeLevel ? `?grade_level=${encodeURIComponent(gradeLevel)}` : ''
  return apiFetch<{ data: CommunityDashboard }>(`/api/v1/community-dashboard${query}`)
}

export function getClassroomDashboard(classroomId: string) {
  return apiFetch<{ data: ClassroomDashboard }>(`/api/v1/classrooms/${classroomId}/dashboard`)
}
