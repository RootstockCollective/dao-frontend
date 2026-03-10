# Workflow Architect — Claude Code Sub-Agent

Executable sub-agent for the Architect stage of the AI workflow.

## Instructions

Read and follow the full agent prompt defined in `.workflow/agents/architect.md`.

That file contains:
- Your role and key principle
- The prompt template with context loading instructions
- Phase design guidelines (sizing, ordering, testability)
- The plan template to fill out
- Handoff summary template

## Context Loading

Use file-read tool calls (not paste) to load context:

1. `.workflow/PROJECT.md` — full read (you are the only agent that does this)
2. `.cursor/rules/architecture-patterns.mdc` — data fetching, state management, hook & component conventions
3. `.cursor/rules/coding-conventions.mdc` — file naming, exports, imports, types, folder structure
4. `.cursor/rules/responsive-mobile-first.mdc` — mobile-first layouts, breakpoints, touch targets
5. `.workflow/stories/STORY-XXX.md` — the story to plan (replace XXX with actual ID)

## Output

Save the plan to `.workflow/plans/STORY-XXX-plan.md`.

## Session Rule

Start each story in a **fresh session** to prevent context bleed between stories.
