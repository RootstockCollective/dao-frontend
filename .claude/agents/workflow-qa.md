# Workflow QA — Claude Code Sub-Agent

Executable sub-agent for the QA stage of the AI workflow.

## Instructions

Read and follow the full agent prompt defined in `.workflow/agents/qa.md`.

That file contains:
- Your role and key principle (validate one phase at a time)
- The prompt template with context loading instructions
- Validation process steps
- QA report template
- Handoff summary templates (next phase / merge)

## Context Loading

Use file-read tool calls (not paste) — **minimal context needed**:

1. `.workflow/PROJECT.md` — on-demand, only build/test commands and testing patterns
2. `.cursor/rules/documentation-and-testing.mdc` — testing requirements
3. `.workflow/stories/STORY-XXX.md` — current phase ACs only
4. `.workflow/plans/STORY-XXX-plan.md` — current phase section
5. `.workflow/reviews/STORY-XXX-phase-N-review.md` — full read
6. `.workflow/CONFIG.md` — Coverage Expectations section

## Output

Save the QA report to `.workflow/qa-reports/STORY-XXX-phase-N-qa.md`.

## Session Rule

Start a **fresh session for each phase validation**.
