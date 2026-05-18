#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SKILLS_DIR="$ROOT_DIR"

errors=0

fail() {
  echo "[FAIL] $1"
  errors=$((errors + 1))
}

warn() {
  echo "[WARN] $1"
}

echo "Validating skills in $SKILLS_DIR"

# 1) Empty top-level skill directories are not allowed.
while IFS= read -r dir; do
  base="$(basename "$dir")"
  case "$base" in
    .|..)
      ;;
    *)
      # Skip known non-skill files and folders handled elsewhere.
      if [[ "$base" == "references" || "$base" == "scripts" || "$base" == "assets" ]]; then
        continue
      fi
      fail "Empty skill directory: $dir"
      ;;
  esac
done < <(find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d -empty | sort)

# 2) Each skill directory must contain SKILL.md.
while IFS= read -r dir; do
  name="$(basename "$dir")"
  if [[ "$name" == ".git" ]]; then
    continue
  fi
  if [[ ! -f "$dir/SKILL.md" ]]; then
    fail "Missing SKILL.md in skill directory: $dir"
    continue
  fi

  # 3) Frontmatter minimum checks.
  if ! grep -q '^---$' "$dir/SKILL.md"; then
    fail "Missing YAML frontmatter marker in $dir/SKILL.md"
    continue
  fi

  if ! grep -q "^name: $name$" "$dir/SKILL.md"; then
    fail "Frontmatter name must exactly match folder name in $dir/SKILL.md"
  fi

  if ! grep -q '^description:' "$dir/SKILL.md"; then
    fail "Missing description in $dir/SKILL.md"
  fi

  if ! grep -q '^argument-hint:' "$dir/SKILL.md"; then
    fail "Missing argument-hint in $dir/SKILL.md"
  fi
done < <(
  find "$SKILLS_DIR" -mindepth 1 -maxdepth 1 -type d \
    ! -name references ! -name scripts ! -name assets | sort
)

if [[ $errors -gt 0 ]]; then
  echo "Validation failed with $errors error(s)."
  echo "Fix errors and re-run: make validate-skills"
  exit 1
fi

echo "All skill checks passed."
