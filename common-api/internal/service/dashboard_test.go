package service

import "testing"

func TestCanAccessGrade(t *testing.T) {
	tests := []struct {
		name          string
		role          string
		userGrade     string
		requested     string
		teacherGrades []string
		want          bool
	}{
		{name: "student own grade", role: "student", userGrade: "M3", requested: "M3", want: true},
		{name: "student other grade", role: "student", userGrade: "M3", requested: "M4", want: false},
		{name: "student blank requested uses own grade", role: "student", userGrade: "M4", requested: "", want: true},
		{name: "student without grade cannot access", role: "student", userGrade: "", requested: "M3", want: false},
		{name: "teacher taught grade", role: "teacher", requested: "M4", teacherGrades: []string{"M3", "M4"}, want: true},
		{name: "teacher untaught grade", role: "teacher", requested: "M2", teacherGrades: []string{"M3", "M4"}, want: false},
		{name: "admin any grade", role: "admin", requested: "M4", want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := canAccessGrade(tt.role, tt.userGrade, tt.requested, tt.teacherGrades); got != tt.want {
				t.Fatalf("canAccessGrade() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestGradeDisplayName(t *testing.T) {
	tests := []struct {
		grade string
		want  string
	}{
		{grade: "M3", want: "ม.3"},
		{grade: "M4", want: "ม.4"},
		{grade: "m3", want: "ม.3"},
		{grade: "Grade 9", want: "Grade 9"},
	}

	for _, tt := range tests {
		if got := gradeDisplayName(tt.grade); got != tt.want {
			t.Fatalf("gradeDisplayName(%q) = %q, want %q", tt.grade, got, tt.want)
		}
	}
}

func TestGradeOptionsDedupesAndLabels(t *testing.T) {
	options := gradeOptions([]string{"M3", "m3", "M4"})

	if len(options) != 2 {
		t.Fatalf("len(gradeOptions()) = %d, want 2", len(options))
	}
	if options[0].Code != "M3" || options[0].Display != "ม.3" {
		t.Fatalf("first option = %+v, want M3 / ม.3", options[0])
	}
	if options[1].Code != "M4" || options[1].Display != "ม.4" {
		t.Fatalf("second option = %+v, want M4 / ม.4", options[1])
	}
}
