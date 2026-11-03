#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "Usage: $0 [--dry-run] [owner/repo]"
  echo "Creates or updates the branch rulesets in .github/rulesets/*.json using the GitHub CLI."
}

DRY_RUN=0
REPO=""
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=1 ;;
    -h|--help) usage; exit 0 ;;
    *) REPO="$arg" ;;
  esac
done

command -v gh >/dev/null || { echo "gh (GitHub CLI) is required: https://cli.github.com" >&2; exit 1; }
gh auth status >/dev/null 2>&1 || { echo "Run 'gh auth login' first." >&2; exit 1; }

ROOT="$(git rev-parse --show-toplevel)"
REPO="${REPO:-$(gh repo view --json nameWithOwner --jq .nameWithOwner)}"
echo "Repository: $REPO"

shopt -s nullglob
files=("$ROOT"/.github/rulesets/*.json)
[ ${#files[@]} -gt 0 ] || { echo "No ruleset files found in .github/rulesets" >&2; exit 1; }

for file in "${files[@]}"; do
  name="$(node -e 'console.log(JSON.parse(require("fs").readFileSync(process.argv[1],"utf8")).name)' "$file")"
  id="$(gh api "repos/$REPO/rulesets" --paginate --jq ".[] | select(.name == \"$name\") | .id" | head -n1)"
  if [ -n "$id" ]; then
    echo "Updating ruleset '$name' (id $id) from $(basename "$file")"
    [ "$DRY_RUN" = 1 ] || gh api --method PUT "repos/$REPO/rulesets/$id" --input "$file" --silent
  else
    echo "Creating ruleset '$name' from $(basename "$file")"
    [ "$DRY_RUN" = 1 ] || gh api --method POST "repos/$REPO/rulesets" --input "$file" --silent
  fi
done

echo
echo "Active rulesets:"
gh api "repos/$REPO/rulesets" --jq '.[] | "  \(.id)  \(.enforcement)  \(.name)"'
