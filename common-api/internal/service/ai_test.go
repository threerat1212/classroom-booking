package service

import (
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
