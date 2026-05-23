package model

import (
	"time"

	"github.com/google/uuid"
)

type GradeOption struct {
	Code    string `json:"code"`
	Display string `json:"display"`
}

type CommunityDashboard struct {
	SelectedGrade      string                      `json:"selected_grade"`
	SelectedGradeLabel string                      `json:"selected_grade_label"`
	AccessibleGrades   []GradeOption               `json:"accessible_grades"`
	PrimaryClassroomID *uuid.UUID                  `json:"primary_classroom_id,omitempty"`
	Stats              CommunityDashboardStats     `json:"stats"`
	Feed               []CommunityAchievementEvent `json:"feed"`
	TopRooms           []CommunityTopRoom          `json:"top_rooms"`
	RareHighlights     []CommunityRareHighlight    `json:"rare_highlights"`
	Classrooms         []CommunityClassroomCard    `json:"classrooms"`
	WeeklyHighlight    *CommunityStudentHighlight  `json:"weekly_highlight,omitempty"`
}

type CommunityDashboardStats struct {
	StudentCount    int `json:"student_count"`
	ClassroomCount  int `json:"classroom_count"`
	RareBadgeCount  int `json:"rare_badge_count"`
	QuestClearCount int `json:"quest_clear_count"`
}

type CommunityAchievementEvent struct {
	Type          string     `json:"type"`
	StudentID     uuid.UUID  `json:"student_id"`
	StudentName   string     `json:"student_name"`
	ClassroomID   *uuid.UUID `json:"classroom_id,omitempty"`
	ClassroomName *string    `json:"classroom_name,omitempty"`
	Title         string     `json:"title"`
	Description   string     `json:"description"`
	Rarity        string     `json:"rarity"`
	OccurredAt    time.Time  `json:"occurred_at"`
}

type CommunityTopRoom struct {
	ClassroomID       uuid.UUID `json:"classroom_id"`
	ClassroomName     string    `json:"classroom_name"`
	GradeLevel        *string   `json:"grade_level,omitempty"`
	ClassSection      *string   `json:"class_section,omitempty"`
	StudentCount      int       `json:"student_count"`
	TotalXP           int       `json:"total_xp"`
	RecentAchievement int       `json:"recent_achievement_count"`
}

type CommunityRareHighlight struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Rarity      string `json:"rarity"`
	EarnedCount int    `json:"earned_count"`
}

type CommunityClassroomCard struct {
	ClassroomID  uuid.UUID `json:"classroom_id"`
	Name         string    `json:"name"`
	Code         string    `json:"code"`
	GradeLevel   *string   `json:"grade_level,omitempty"`
	ClassSection *string   `json:"class_section,omitempty"`
	StudentCount int       `json:"student_count"`
	IsPrimary    bool      `json:"is_primary"`
}

type CommunityStudentHighlight struct {
	StudentID uuid.UUID `json:"student_id"`
	FullName  string    `json:"full_name"`
	XP        int       `json:"xp"`
	Level     int       `json:"level"`
	RankTitle *string   `json:"rank_title,omitempty"`
}

type ClassroomDashboard struct {
	Classroom     *Classroom                  `json:"classroom"`
	Leaderboard   []ClassroomLeaderboardEntry `json:"leaderboard"`
	BadgeWall     []ClassroomBadgeWallItem    `json:"badge_wall"`
	QuestProgress ClassroomQuestProgress      `json:"quest_progress"`
	RecentMoments []CommunityAchievementEvent `json:"recent_moments"`
}

type ClassroomLeaderboardEntry struct {
	Rank      int       `json:"rank"`
	StudentID uuid.UUID `json:"student_id"`
	FullName  string    `json:"full_name"`
	XP        int       `json:"xp"`
	Level     int       `json:"level"`
	RankTitle *string   `json:"rank_title,omitempty"`
}

type ClassroomBadgeWallItem struct {
	StudentID   uuid.UUID `json:"student_id"`
	StudentName string    `json:"student_name"`
	Code        string    `json:"code"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Rarity      string    `json:"rarity"`
	EarnedAt    time.Time `json:"earned_at"`
}

type ClassroomQuestProgress struct {
	ActiveQuestCount  int `json:"active_quest_count"`
	CompletedCount    int `json:"completed_count"`
	ParticipantCount  int `json:"participant_count"`
	CompletionPercent int `json:"completion_percent"`
}
