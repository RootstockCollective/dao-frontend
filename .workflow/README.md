# AI-Assisted Development Workflow

A structured workflow for AI agents to collaborate on software development with human oversight.

---

## Quick Links

| Document | Purpose |
|----------|---------|
| [PROJECT.md](./PROJECT.md) | **Project-specific context** (tech stack, patterns, domain) |
| [CONFIG.md](./CONFIG.md) | Workflow config (HITL, story sources, coverage targets) |
| [STORY_TEMPLATE.md](./STORY_TEMPLATE.md) | Template for creating new user stories |
| [rules/](./rules/) | **Coding standards** (architecture, conventions, testing, git — model-agnostic) |
| **Agents** | |
| [agents/architect.md](./agents/architect.md) | Creates implementation plans |
| [agents/developer.md](./agents/developer.md) | Implements the code |
| [agents/code-review.md](./agents/code-review.md) | Reviews code quality |
| [agents/qa.md](./agents/qa.md) | Validates acceptance criteria |
| [agents/retro.md](./agents/retro.md) | Retrospective and rule improvement |
| [agents/user-story-creator.md](./agents/user-story-creator.md) | Creates user stories from requirements |
| [agents/workload-analyst.md](./agents/workload-analyst.md) | Analyzes workload and effort |

---

## Workflow Overview

This workflow uses **phase-by-phase completion** with **co-located tests**. Three **workflow tracks** control how much ceremony each change needs — see [CONFIG.md](./CONFIG.md#workflow-tracks) for track definitions.

- The Architect analyzes everything upfront and creates a phased plan
- Each phase completes the full cycle (Dev → Review → QA) before the next begins
- The Developer implements code alongside co-located unit tests (Vitest + React Testing Library)
- After ALL phases, a Retrospective captures learnings and proposes rule improvements

```
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│   ┌─────────┐    ┌───────────┐                                     │
│   │  Story  │───▶│ Architect │──┐                                  │
│   │         │    │   Agent   │  │                                  │
│   └─────────┘    └───────────┘  │                                  │
│        │              │         │                                  │
│        ▼              ▼         │                                  │
│   [STORY.md]    [FULL plan.md]  │  Analyzes ALL requirements       │
│                 with PHASES     │  upfront, creates phased plan    │
│                 + APPROVAL      │                                  │
│                                 │                                  │
│   ┌─────────────────────────────┼──────────────────────────────┐   │
│   │  FOR EACH PHASE:            ▼                              │   │
│   │  ┌───────────┐    ┌────────────┐    ┌───────────┐          │   │
│   │  │ Developer │───▶│   Code     │───▶│    QA     │──┐       │   │
│   │  │   Agent   │    │   Review   │    │   Agent   │  │       │   │
│   │  └───────────┘    └────────────┘    └───────────┘  │       │   │
│   │       │                │                  │        │       │   │
│   │       ▼                ▼                  ▼        │       │   │
│   │  [code + tests   [phase-N-        [phase-N-       │       │   │
│   │   co-located]     review.md]       qa.md]         │       │   │
│   │                   + APPROVAL       + APPROVAL     │       │   │
│   │                                         │         │       │   │
│   │                                         ▼         │       │   │
│   │                                   Next Phase ◀────┘       │   │
│   └───────────────────────────────────────────────────────────┘   │
│                                                                     │
│   ┌─────────┐                                                      │
│   │  Merge  │◀── After ALL phases complete                         │
│   └─────────┘                                                      │
│        │                                                            │
│        ▼                                                            │
│   [merged]                                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Workflow Stages

### 1. Story Definition

**Input:** Business requirement
**Output:** `.workflow/stories/STORY-XXX.md`
**Human Action:** Write or approve the story

Create a user story using the [STORY_TEMPLATE.md](./STORY_TEMPLATE.md). Include:
- Clear description
- Acceptance criteria (testable)
- Technical notes
- Priority and size estimates

### 2. Architecture (Architect Agent) — Analyzes ALL Upfront

**Input:** Story file
**Output:** `.workflow/plans/STORY-XXX-plan.md`
**Human Action:** Approve or request changes to the plan

The [Architect Agent](./agents/architect.md) is the **only agent that sees the full picture**:
- Analyzes the complete story and all acceptance criteria
- Creates a detailed implementation plan with **well-defined phases**
- Maps each acceptance criterion to specific phases
- Identifies risks and dependencies across phases
- Proposes testing strategy for each phase

### 3-5. Phase Loop (Developer → Code Review → QA)

Each phase from the plan goes through the complete cycle before the next phase begins.

#### Developer Agent

**Input:** Current phase from approved plan
**Output:** Code, tests, commits for ONE phase
**Human Action:** Monitor progress

The [Developer Agent](./agents/developer.md) implements code alongside co-located tests:
1. **Implement:** Write code following existing patterns (PROJECT.md)
2. **Test:** Write co-located unit tests (`*.test.ts` / `*.test.tsx`)
3. **Validate:** Ensure all checks pass before handoff

**Validation Gate:** See [CONFIG.md](./CONFIG.md#validation-gates)
- `npm run build` must pass
- `npm run lint` must pass with 0 errors
- `npm run lint-tsc` must pass with 0 errors
- `npm run test` must pass

#### Code Review Agent

**Input:** Implemented phase code
**Output:** `.workflow/reviews/STORY-XXX-phase-N-review.md`
**Human Action:** Approve or request changes

The [Code Review Agent](./agents/code-review.md) reviews ONE phase:
- Verifies tests exist, are co-located, and are meaningful
- Reviews code quality, Next.js patterns, and Web3 patterns
- Evaluates test coverage (see [CONFIG.md](./CONFIG.md#coverage-expectations))
- Checks security considerations

#### QA Agent

**Input:** Reviewed phase code
**Output:** `.workflow/qa-reports/STORY-XXX-phase-N-qa.md`
**Human Action:** Approve to proceed to next phase

The [QA Agent](./agents/qa.md) validates ONE phase:
- Validates acceptance criteria covered by this phase
- Runs full test suite
- Verifies coverage targets
- Approves progression to next phase

### 6. Merge

**Input:** All phases completed and approved
**Output:** Merged to main
**Human Action:** Merge the PR

### 7. Retrospective (Retro Agent)

**Input:** Story file, plan, all reviews, all QA reports, devlog(s)
**Output:** `.workflow/_retros/STORY-XXX-retro.md`
**Human Action:** Approve or reject proposed rule changes

The [Retro Agent](./agents/retro.md) runs after merge and captures:
- What went well and what didn't
- Deviations from the plan and their causes
- Proposed changes to `.workflow/rules/` files (the **agentic flywheel** — each story's retro makes the rules better, which makes the next story's agent output better, which produces fewer retro findings; this is human-supervised improvement, not autonomous)
- Actionable items for future workflow improvement

---

## Directory Structure

```
.workflow/
├── README.md                 # This file - workflow overview
├── PROJECT.md                # Project-specific context (tech stack, patterns)
├── CONFIG.md                 # Workflow configuration (HITL, tracks, coverage, context)
├── STORY_TEMPLATE.md         # Template for new stories
├── WORKFLOW_AUDIT_REPORT.md  # Audit report (reference)
│
├── rules/                    # Coding standards (model-agnostic; agents load these)
│   ├── architecture-patterns.md
│   ├── coding-conventions.md
│   ├── documentation-and-testing.md
│   ├── git-commits.md
│   ├── responsive-mobile-first.md
│   ├── tech-debt-on-touch.md
│   └── docs-in-pr.md
│
├── agents/                   # Agent definitions
│   ├── architect.md          # Architecture planning
│   ├── developer.md          # Implementation
│   ├── code-review.md        # Code review
│   ├── qa.md                 # QA validation
│   ├── retro.md              # Retrospective + rule improvement
│   ├── user-story-creator.md # Story creation from requirements
│   └── workload-analyst.md   # Workload analysis
│
├── stories/                  # User stories
│   └── STORY-XXX.md
│
├── plans/                    # Architecture plans
│   └── STORY-XXX-plan.md
│
├── devlogs/                  # Developer implementation logs
│   └── STORY-XXX-phase-N-devlog.md
│
├── reviews/                  # Code review reports
│   └── STORY-XXX-phase-N-review.md
│
├── qa-reports/               # QA reports
│   └── STORY-XXX-phase-N-qa.md
│
└── _retros/                  # Retrospective reports
    └── STORY-XXX-retro.md
```

### What gets committed vs local-only

Handoff artifacts (stories, plans, reviews, qa-reports) are **gitignored**. They are useful during the workflow for passing context between agents but are not needed in the repo after merge.

| Path | Committed? | Why |
|------|------------|-----|
| `.workflow/stories/`, `plans/`, `reviews/`, `qa-reports/` | **No** | Handoff-only; no need to keep in repo once code is pushed |
| `.workflow/devlogs/`, `.workflow/_retros/` | **Yes** | Used to improve the workflow (retros propose rule changes; devlogs document deviations) |
| `.workflow/rules/`, `agents/`, `CONFIG.md`, `PROJECT.md`, etc. | **Yes** | Canonical workflow and project context |

**Before push:** You don't need to do anything — handoff dirs are already ignored. Optionally, to remove them from disk (e.g. to avoid clutter or free space), run:

```bash
./scripts/clean-workflow-handoffs.sh
```

This deletes the contents of `stories/`, `plans/`, `reviews/`, and `qa-reports/` only; it does not touch devlogs or retros.

---

## Human-in-the-Loop (HITL) Integration

The workflow requires human approval at key points:

| Stage | Approval Required | Current Method |
|-------|-------------------|----------------|
| Story | Define/approve story | CLI / Markdown |
| Architecture | Approve implementation plan | CLI |
| Code Review | Approve for QA | CLI |
| QA | Approve for merge | CLI |
| Merge | Execute merge | CLI / GitHub |

**Configuring HITL:** See [CONFIG.md](./CONFIG.md#human-in-the-loop-hitl-integration)

Future integrations (Slack, etc.) can be configured in CONFIG.md.

---

## Orchestrator Role

The **human orchestrator** drives the workflow. There is no automated pipeline — the human decides:

1. **Which track** to use for a given change (quick / standard / complex — see [CONFIG.md](./CONFIG.md#workflow-tracks))
2. **When to invoke** each agent (copy the prompt, paste context, run)
3. **When to approve** and move to the next stage
4. **When to deviate** from the plan (document deviations in the devlog)
5. **When to stop** — not every story needs every agent

The orchestrator is responsible for context management: starting fresh sessions per phase and providing only the context each agent needs (see [CONFIG.md](./CONFIG.md#context-management)).

---

## Story Source Integration

Stories can come from different sources:

| Source | Current | Future |
|--------|---------|--------|
| Markdown files | Yes | Yes |
| Jira | No | Planned |
| GitHub Issues | No | Possible |

**Configuring Story Source:** See [CONFIG.md](./CONFIG.md#story-source-integration)

---

## Coverage Expectations

Test coverage targets vary by file type:

| File Type | Target | Blocking? |
|-----------|--------|-----------|
| Utilities | 90%+ | Yes |
| Services | 80%+ | Yes |
| Entry Points | 60%+ | No |
| Config | 70%+ | No |
| Models | N/A | N/A |

**Detailed coverage config:** See [CONFIG.md](./CONFIG.md#coverage-expectations)

---

## Adapter generation and tool-specific entry points

The workflow is **model-agnostic**: only `.workflow/` is committed. Each AI tool gets a **tool-specific entry point** generated by a script so the tool can apply the same rules and agents.

### Script

From the repo root:

```bash
./scripts/export-workflow-adapters.sh [--cursor] [--claude] [--copilot]
```

- **No args (or `--all`):** Generate adapters for all tools.
- **With flags:** Generate only for the specified tool(s). Example: `--cursor --claude` creates only Cursor and Claude outputs.

Generated files and directories are **gitignored** (CLAUDE.md, .cursor/agents/, .github/copilot-instructions.md). After clone, run the script with the flag for your tool to create them locally.

### What gets generated

| Tool        | Output | Purpose |
|-------------|--------|---------|
| Cursor      | `.cursor/agents/*.mdc` | One thin wrapper per agent; @-mention or open to run that agent. |
| Claude Code | `CLAUDE.md` (repo root) | Auto-loaded at session start; tells Claude to read `.workflow/agents/<name>.md` for each agent. |
| Copilot     | `.github/copilot-instructions.md` | Auto-loaded by GitHub Copilot; condensed project context + pointer to `.workflow/`. |

### Adding adapters for new tools

To support another tool (e.g. Codex):

1. Determine where that tool reads project instructions (e.g. AGENTS.md, a config path).
2. Add a new `*_emit()` function in `scripts/export-workflow-adapters.sh` that writes the expected file(s) with thin content pointing to `.workflow/agents/` and context to load.
3. Add a flag (e.g. `--codex`) and call the new emitter when that flag is passed.
4. Document the tool in "Getting Started per Tool" below.

Until a tool has a standard, document it as "bring your own entry point" and point users to this section.

---

## Getting Started per Tool

**First time / after clone:** Run the script to generate adapters for your tool:

```bash
./scripts/export-workflow-adapters.sh --cursor   # or --claude or --copilot
```

Then use the workflow as follows per tool.

### Claude Code

- **Auto-loaded:** `CLAUDE.md` at repo root (generated; Claude Code reads it at session start).
- **To run an agent:** Ask Claude to run the agent, e.g. "Run the Architect agent for STORY-XXX." Claude will read `.workflow/agents/architect.md` and the context listed there (PROJECT.md, story, plan paths).
- **Context:** Loaded via file-read as instructed in each `.workflow/agents/<name>.md` file.

### Cursor

- **Auto-loaded:** When using Cursor, the export script can sync `.workflow/rules/` to `.cursor/rules/` so Cursor auto-loads them; otherwise agents read `.workflow/rules/*.md` per the workflow.
- **To run an agent:** @-mention the agent (e.g. `@architect.mdc`) or open the agent file; then ask it to run for a story/phase. The wrapper tells Cursor to read `.workflow/agents/<name>.md` and load the context listed there (including `.workflow/rules/`).
- **Rules:** Canonical coding conventions live in `.workflow/rules/`; workflow logic stays in `.workflow/`.

### Codex

- **Entry point:** No standard yet. Use AGENTS.md or a repo-specific file; see "Adding adapters for new tools" above to extend the script.
- **To run an agent:** Point the tool at the workflow (e.g. "Read `.workflow/agents/architect.md` and run as Architect for this story").

### Copilot

- **Auto-loaded:** `.github/copilot-instructions.md` (generated; first 4000 chars used by code review).
- **To run an agent:** For full workflow and agent prompts, see `.workflow/README.md` and `.workflow/agents/`. The generated file gives condensed project context and a pointer to the workflow.

---

## Getting Started (workflow steps)

### Starting a New Story

1. Get a story from JIRA and put it in `stories/STORY-XXX.md` - ask AI to follow the STORY_TEMPLATE.md
2. Mark as "Ready for Development"

### Running the Workflow

1. **Architecture:** Use the prompt in [agents/architect.md](./agents/architect.md) (or invoke via your tool's adapter).
2. **Development:** Use the prompt in [agents/developer.md](./agents/developer.md)
3. **Code Review:** Use the prompt in [agents/code-review.md](./agents/code-review.md)
4. **QA:** Use the prompt in [agents/qa.md](./agents/qa.md)

### Viewing Status

Check the story file's status checkboxes:
```markdown
- [x] Draft
- [x] Ready for Development
- [x] In Architecture
- [ ] In Development  ← Current stage
- [ ] In Review
- [ ] In QA
- [ ] Done
```

---

The agents are designed to be project-agnostic. All project-specific knowledge lives in PROJECT.md.
