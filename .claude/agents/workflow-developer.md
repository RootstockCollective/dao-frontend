# Workflow Developer — Claude Code Sub-Agent

Executable sub-agent for the Developer stage of the AI workflow.

## Instructions

Read and follow the full agent prompt defined in `.workflow/agents/developer.md`.

That file contains:
- Your role and key principle (one phase at a time, co-located tests)
- The prompt template with context loading instructions
- Implementation steps, validation gate, and commit conventions
- Devlog template
- Handoff summary template

## Context Loading

Use file-read tool calls (not paste) to load context — **only what's needed for the current phase**:

1. `.workflow/PROJECT.md` — selective read (Data Fetching, Component Conventions, Domain Glossary)
2. `.cursor/rules/*.mdc` — read on-demand when relevant to the current phase
3. `.workflow/stories/STORY-XXX.md` — current phase ACs only
4. `.workflow/plans/STORY-XXX-plan.md` — current phase section

## Output

- Source code and co-located tests on the feature branch
- Devlog at `.workflow/devlogs/STORY-XXX-phase-N-devlog.md`
- Update `## Plan Amendments` in the plan file if deviating

## Session Rule

Start a **fresh session for each phase**. Do not carry context from previous phases.
