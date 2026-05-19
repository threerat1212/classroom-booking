package service

import (
	"encoding/json"
	"strings"
	"testing"
	"unicode/utf8"
)

func TestAIChatSessionTitleTruncatesMultibyteSafely(t *testing.T) {
	message := strings.Repeat("\u0e15", 60)

	title := aiChatSessionTitle(message)

	if !utf8.ValidString(title) {
		t.Fatalf("title is not valid UTF-8: %q", title)
	}
	if !strings.HasSuffix(title, "...") {
		t.Fatalf("expected truncated title suffix, got %q", title)
	}

	trimmed := strings.TrimSuffix(title, "...")
	if got := utf8.RuneCountInString(trimmed); got != 50 {
		t.Fatalf("expected 50 runes before suffix, got %d", got)
	}
}

func TestAIChatSessionTitleFallsBackForBlankMessage(t *testing.T) {
	if got := aiChatSessionTitle(" \n\t "); got != "New chat" {
		t.Fatalf("expected fallback title, got %q", got)
	}
}

func TestAnswersEquivalentNormalizesText(t *testing.T) {
	if !answersEquivalent("Gravity (downward) and Normal force (upward)", "gravity downward and normal force upward") {
		t.Fatal("expected normalized text answers to match")
	}
}

func TestAnswersEquivalentAcceptsNumericOnlyAnswerWithWords(t *testing.T) {
	if !answersEquivalent("56", "The answer is 56.") {
		t.Fatal("expected numeric-only answer to match when student includes words")
	}
}

func TestAnswersEquivalentAcceptsCommaFormattedNumber(t *testing.T) {
	if !answersEquivalent("1,245.0", "1245") {
		t.Fatal("expected comma-formatted numeric answer to match")
	}
}

func TestAnswersEquivalentDoesNotDropRequiredText(t *testing.T) {
	if answersEquivalent("1.6 m/s² east", "1.6") {
		t.Fatal("expected required unit/direction text to prevent numeric-only match")
	}
}

func TestQuestExpForScoreIsServerControlled(t *testing.T) {
	cases := []struct {
		score     int
		maxExp    int
		attempted bool
		want      int
	}{
		{score: 100, maxExp: 25, attempted: true, want: 25},
		{score: 79, maxExp: 25, attempted: true, want: 12},
		{score: 30, maxExp: 25, attempted: true, want: 2},
		{score: 0, maxExp: 25, attempted: true, want: 0},
		{score: 100, maxExp: 25, attempted: false, want: 0},
	}

	for _, tc := range cases {
		if got := questExpForScore(tc.score, tc.maxExp, tc.attempted); got != tc.want {
			t.Fatalf("questExpForScore(%d, %d, %v) = %d, want %d", tc.score, tc.maxExp, tc.attempted, got, tc.want)
		}
	}
}

func TestNormalizeGeneratedQuestsOrdersAndClampsDifficultySettings(t *testing.T) {
	input := []generatedQuestPayload{
		{Difficulty: "expert", Title: "Expert", Question: "Q4", Answer: "A4", Hints: []string{"h1"}, Explanation: "E4", ExpReward: 999, TimeLimitMinutes: 999},
		{Difficulty: "easy", Title: "Easy", Question: "Q1", Answer: "A1", Hints: []string{"h1", "h2"}, Explanation: "E1"},
		{Difficulty: "hard", Title: "Hard", Question: "Q3", Answer: "A3", Hints: []string{"h1", "h2"}, Explanation: "E3"},
		{Difficulty: "medium", Title: "Medium", Question: "Q2", Answer: "A2", Hints: []string{"h1", "h2"}, Explanation: "E2"},
	}

	quests, err := normalizeGeneratedQuests(input, "Fractions")
	if err != nil {
		t.Fatalf("normalizeGeneratedQuests returned error: %v", err)
	}

	for i, difficulty := range questDifficultyOrder {
		if quests[i].Difficulty != difficulty {
			t.Fatalf("quest %d difficulty = %s, want %s", i, quests[i].Difficulty, difficulty)
		}
	}
	if quests[3].ExpReward != 80 || quests[3].TimeLimitMinutes != 20 {
		t.Fatalf("expected expert settings to be server-controlled, got exp=%d time=%d", quests[3].ExpReward, quests[3].TimeLimitMinutes)
	}
	if len(quests[3].Hints) != 2 {
		t.Fatalf("expected hints to be padded to 2, got %d", len(quests[3].Hints))
	}
}

func TestNormalizeGeneratedQuestsFillsOptionalText(t *testing.T) {
	input := []generatedQuestPayload{
		{Difficulty: "ง่าย", Question: "Q1", Answer: "A1"},
		{Difficulty: "medium", Question: "Q2", Answer: "A2"},
		{Difficulty: "hard", Question: "Q3", Answer: "A3"},
		{Difficulty: "expert", Question: "Q4", Answer: "A4"},
	}

	quests, err := normalizeGeneratedQuests(input, "เรื่องสารเคมี ม.4")
	if err != nil {
		t.Fatalf("normalizeGeneratedQuests returned error: %v", err)
	}

	if quests[0].Title == "" {
		t.Fatal("expected missing title to be filled")
	}
	if quests[0].Explanation == "" {
		t.Fatal("expected missing explanation to be filled")
	}
}

func TestGeneratedQuestPayloadAcceptsProviderAliases(t *testing.T) {
	payload := []byte(`{
		"level":"easy",
		"name":"Alias title",
		"prompt":"What is H2O?",
		"correct_answer":"water",
		"hint":"Think of a common liquid.",
		"solution_explanation":"H2O is water.",
		"xp":"99",
		"minutes":7
	}`)

	var quest generatedQuestPayload
	if err := json.Unmarshal(payload, &quest); err != nil {
		t.Fatalf("failed to unmarshal alias payload: %v", err)
	}

	if quest.Difficulty != "easy" || quest.Title != "Alias title" || quest.Question != "What is H2O?" || quest.Answer != "water" {
		t.Fatalf("unexpected alias parse result: %+v", quest)
	}
	if len(quest.Hints) != 1 || quest.Hints[0] != "Think of a common liquid." {
		t.Fatalf("unexpected hints: %+v", quest.Hints)
	}
}
