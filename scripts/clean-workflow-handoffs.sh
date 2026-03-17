#!/bin/bash
#
# Remove workflow handoff artifacts (stories, plans, reviews, qa-reports) from disk.
# Use before or after push to avoid keeping local-only .md files that were only
# needed for agent handoffs. Does NOT touch devlogs/ or _retros/ (those are kept for workflow improvement).
#
# Usage: ./scripts/clean-workflow-handoffs.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW="$REPO_ROOT/.workflow"

if [ ! -d "$WORKFLOW" ]; then
  echo "Error: .workflow/ not found at $WORKFLOW" >&2
  exit 1
fi

for dir in stories plans reviews qa-reports; do
  path="$WORKFLOW/$dir"
  if [ -d "$path" ]; then
    # Remove contents only; leave dir so next story can use it
    count=$(find "$path" -maxdepth 1 -type f 2>/dev/null | wc -l | tr -d ' ')
    if [ "$count" -gt 0 ]; then
      rm -f "$path"/*
      echo "  cleared $dir/ ($count file(s))"
    fi
  fi
done

echo "Done. devlogs/ and _retros/ were not modified."
