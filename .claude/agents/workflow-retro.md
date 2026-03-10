# Workflow Retro — Claude Code Sub-Agent

Executable sub-agent for the Retrospective stage of the AI workflow.

## Instructions

Read and follow the full agent prompt defined in `.workflow/agents/retro.md`.

That file contains:
- Your role and key principle (agentic flywheel — human-supervised rule improvement)
- The prompt template with context loading instructions
- Analysis steps (plan vs reality, review/QA findings, systemic patterns, rule proposals)
- Retro report template with proposed rule changes section

## Context Loading

Use file-read tool calls to load **all artifacts for the completed story**:

1. `.workflow/stories/STORY-XXX.md` — full read
2. `.workflow/plans/STORY-XXX-plan.md` — full read
3. `.workflow/reviews/STORY-XXX-phase-*-review.md` — all phase reviews
4. `.workflow/qa-reports/STORY-XXX-phase-*-qa.md` — all phase QA reports
5. `.workflow/devlogs/STORY-XXX-phase-*-devlog.md` — all phase devlogs
6. `.cursor/rules/*.mdc` — skim for sections relevant to findings

## Output

Save the retro to `.workflow/_retros/STORY-XXX-retro.md`.

## The Agentic Flywheel

Each story's retro proposes changes to `.cursor/rules/` files. The human orchestrator reviews and accepts/rejects each proposal. Accepted changes improve agent output for the next story, producing fewer findings over time.

**Do NOT modify `.cursor/rules/` files directly.** Only propose diffs in the retro report.

## Session Rule

Run **once per story, after merge**. Fresh session.
