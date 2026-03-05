# Workflow Reviewer — Claude Code Sub-Agent

Executable sub-agent for the Code Review stage of the AI workflow.

## Instructions

Read and follow the full agent prompt defined in `.workflow/agents/code-review.md`.

That file contains:
- Your role and key principle (review one phase at a time)
- The prompt template with context loading instructions
- Review process steps (including plan adherence check)
- Review report template
- Handoff summary template

## Context Loading

Use file-read tool calls (not paste) — focus on the **phase diff and devlog**:

1. `.workflow/PROJECT.md` — on-demand, only sections relevant to patterns in the diff
2. `.cursor/rules/*.mdc` — read each rule file as the canonical review checklist
3. `.workflow/stories/STORY-XXX.md` — current phase ACs only
4. `.workflow/plans/STORY-XXX-plan.md` — current phase section
5. `.workflow/devlogs/STORY-XXX-phase-N-devlog.md` — full read
6. Run `git diff` to see the phase changes

## Output

Save the review to `.workflow/reviews/STORY-XXX-phase-N-review.md`.

## Session Rule

Start a **fresh session for each phase review**.
