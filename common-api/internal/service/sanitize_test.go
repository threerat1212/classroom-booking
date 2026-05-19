package service

import (
	"encoding/json"
	"testing"
)

func TestSanitizeJSONControlChars_RawNewlineInString(t *testing.T) {
	bad := "{\"question\": \"What is 1+1?\nA basic question.\", \"answer\": \"2\"}"
	got := sanitizeJSONControlChars(bad)

	var result map[string]string
	if err := json.Unmarshal([]byte(got), &result); err != nil {
		t.Fatalf("expected valid JSON after sanitize, got error: %v\noutput: %s", err, got)
	}
	if result["answer"] != "2" {
		t.Errorf("answer = %q, want %q", result["answer"], "2")
	}
}

func TestSanitizeJSONControlChars_PreservesValidEscapes(t *testing.T) {
	input := `{"x": "valid\n escape"}`
	got := sanitizeJSONControlChars(input)
	if got != input {
		t.Errorf("valid escape not preserved\ninput:  %s\noutput: %s", input, got)
	}
}

func TestSanitizeJSONControlChars_RawTabAndCR(t *testing.T) {
	bad := "{\"a\": \"x\ty\rz\"}"
	got := sanitizeJSONControlChars(bad)
	var result map[string]string
	if err := json.Unmarshal([]byte(got), &result); err != nil {
		t.Fatalf("expected valid JSON, got: %v\noutput: %s", err, got)
	}
	if result["a"] != "x\ty\rz" {
		t.Errorf("a = %q, want %q", result["a"], "x\ty\rz")
	}
}

func TestSanitizeJSONControlChars_ThaiText(t *testing.T) {
	bad := "{\"q\": \"การบวก\nคืออะไร\"}"
	got := sanitizeJSONControlChars(bad)
	var result map[string]string
	if err := json.Unmarshal([]byte(got), &result); err != nil {
		t.Fatalf("expected valid JSON with Thai, got: %v\noutput: %s", err, got)
	}
	if result["q"] != "การบวก\nคืออะไร" {
		t.Errorf("Thai text corrupted: %q", result["q"])
	}
}

func TestIsExactAnswerMatch(t *testing.T) {
	cases := []struct {
		name    string
		student string
		correct string
		want    bool
	}{
		{"plain numeric equal", "1245", "1245", true},
		{"with comma vs without", "1,245", "1245", true},
		{"trailing spaces", "  1245  ", "1245", true},
		{"trailing decimal zero", "1245.0", "1245", true},
		{"case-insensitive text", "Bangkok", "bangkok", true},
		{"trailing punctuation", "answer.", "answer", true},
		{"thai exact", "การบวก", "การบวก", true},
		{"different numbers", "1245", "1246", false},
		{"different text", "apple", "banana", false},
		{"empty inputs", "", "", true},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := isExactAnswerMatch(tc.student, tc.correct)
			if got != tc.want {
				t.Errorf("isExactAnswerMatch(%q, %q) = %v, want %v", tc.student, tc.correct, got, tc.want)
			}
		})
	}
}
