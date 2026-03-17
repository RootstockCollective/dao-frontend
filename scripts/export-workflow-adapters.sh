#!/bin/bash
#
# Export model-agnostic .workflow/ agents into tool-specific adapter files.
# Usage: ./scripts/export-workflow-adapters.sh [--cursor] [--claude] [--copilot]
#   No args or --all: generate for all tools.
#   With flags: generate only for the specified tool(s).
#
# Creates/overwrites: .cursor/agents/*.mdc, CLAUDE.md, .github/copilot-instructions.md
# (and dirs if missing). These outputs are gitignored; only .workflow/ is committed.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
WORKFLOW_AGENTS="$REPO_ROOT/.workflow/agents"
PROJECT_MD="$REPO_ROOT/.workflow/PROJECT.md"

DO_CURSOR=false
DO_CLAUDE=false
DO_COPILOT=false

for arg in "$@"; do
  case "$arg" in
    --cursor)   DO_CURSOR=true ;;
    --claude)   DO_CLAUDE=true ;;
    --copilot)  DO_COPILOT=true ;;
    --all)      DO_CURSOR=true; DO_CLAUDE=true; DO_COPILOT=true ;;
    -h|--help)
      echo "Usage: $0 [--cursor] [--claude] [--copilot] | [--all]"
      echo "  No args: generate for all tools."
      echo "  Flags: generate only for specified tool(s)."
      exit 0
      ;;
    *)
      echo "Unknown option: $arg" >&2
      exit 1
      ;;
  esac
done

# No flags => all
if ! $DO_CURSOR && ! $DO_CLAUDE && ! $DO_COPILOT; then
  DO_CURSOR=true
  DO_CLAUDE=true
  DO_COPILOT=true
fi

if [ ! -d "$WORKFLOW_AGENTS" ]; then
  echo "Error: .workflow/agents/ not found at $WORKFLOW_AGENTS" >&2
  exit 1
fi

# Get agent display name from first # line in agent .md
agent_display_name() {
  local f="$1"
  local line
  line=$(grep -m1 '^# ' "$f" 2>/dev/null || true)
  echo "${line#\# }"
}

# --- Cursor: .cursor/agents/<name>.mdc
cursor_emit() {
  mkdir -p "$REPO_ROOT/.cursor/agents"
  for agent_md in "$WORKFLOW_AGENTS"/*.md; do
    [ -f "$agent_md" ] || continue
    name=$(basename "$agent_md" .md)
    display=$(agent_display_name "$agent_md")
    mdc="$REPO_ROOT/.cursor/agents/$name.mdc"
    {
      echo "---"
      echo "description: $display — read full prompt from .workflow/agents/$name.md"
      echo "alwaysApply: false"
      echo "---"
      echo ""
      echo "# $display"
      echo ""
      echo "Read and follow the full agent prompt in \`.workflow/agents/$name.md\`."
      echo ""
      echo "## Context to load (use file-read / @)"
      echo "- \`.workflow/PROJECT.md\` (sections relevant to this agent)"
      echo "- \`.workflow/rules/*.md\` (coding standards)"
      echo "- Story/plan/review paths as specified in the agent file."
    } > "$mdc"
    echo "  wrote $mdc"
  done
}

# --- Claude: CLAUDE.md at repo root
claude_emit() {
  local out="$REPO_ROOT/CLAUDE.md"
  {
    echo "# Project instructions"
    echo ""
    echo "This repo uses a model-agnostic AI workflow. To run an agent, read the full prompt from the corresponding file under \`.workflow/agents/\`."
    echo ""
    echo "## Workflow agents"
    echo ""
    for agent_md in "$WORKFLOW_AGENTS"/*.md; do
      [ -f "$agent_md" ] || continue
      name=$(basename "$agent_md" .md)
      display=$(agent_display_name "$agent_md")
      echo "- **$display**: Read \`.workflow/agents/$name.md\`. Load context listed there (PROJECT.md, .workflow/rules, story/plan paths)."
    done
    echo ""
    echo "After clone, run \`./scripts/export-workflow-adapters.sh --claude\` to regenerate this file if needed."
  } > "$out"
  echo "  wrote $out"
}

# --- Copilot: .github/copilot-instructions.md (under 4k chars) with project summary + workflow pointer
copilot_emit() {
  mkdir -p "$REPO_ROOT/.github"
  local out="$REPO_ROOT/.github/copilot-instructions.md"
  local max_chars=3900

  # Condensed project context from PROJECT.md: first sections (by line) so we stay under 4k total
  local summary=""
  if [ -f "$PROJECT_MD" ]; then
    summary=$(head -n 70 "$PROJECT_MD")
  else
    summary="(Run from repo root; .workflow/PROJECT.md not found.)"
  fi

  {
    echo "# Project context (condensed)"
    echo ""
    echo "$summary"
    echo ""
    echo "---"
    echo ""
    echo "# AI workflow"
    echo ""
    echo "Full workflow and agents: \`.workflow/README.md\`, \`.workflow/agents/\`. Generate adapters with \`./scripts/export-workflow-adapters.sh --copilot\`."
  } > "$out"

  local len
  len=$(wc -c < "$out" | tr -d ' ')
  if [ "$len" -gt 4000 ]; then
    echo "  warning: $out is $len chars (Copilot code review uses first 4000)" >&2
  fi
  echo "  wrote $out ($len chars)"
}

# --- Run
cd "$REPO_ROOT"

if $DO_CURSOR; then
  echo "Cursor adapters:"
  cursor_emit
fi

if $DO_CLAUDE; then
  echo "Claude CLAUDE.md:"
  claude_emit
fi

if $DO_COPILOT; then
  echo "Copilot .github/copilot-instructions.md:"
  copilot_emit
fi

echo "Done."
