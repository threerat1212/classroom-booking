package service

import "testing"

func TestLevelFromXpMatchesThresholds(t *testing.T) {
	tests := []struct {
		xp    int
		level int
	}{
		{0, 1},
		{85, 1},
		{100, 2},
		{299, 2},
		{300, 3},
		{5000, 10},
	}

	for _, tt := range tests {
		if got := LevelFromXp(tt.xp); got != tt.level {
			t.Fatalf("LevelFromXp(%d) = %d, want %d", tt.xp, got, tt.level)
		}
	}
}

func TestGradeCodeForScore(t *testing.T) {
	tests := []struct {
		score int
		want  string
	}{
		{49, "0"},
		{50, "1"},
		{55, "1.5"},
		{60, "2"},
		{65, "2.5"},
		{70, "3"},
		{75, "3.5"},
		{80, "4"},
		{100, "4"},
	}

	for _, tt := range tests {
		if got := GradeCodeForScore(tt.score, 100); got != tt.want {
			t.Fatalf("GradeCodeForScore(%d, 100) = %s, want %s", tt.score, got, tt.want)
		}
	}
}
