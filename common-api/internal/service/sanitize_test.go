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
