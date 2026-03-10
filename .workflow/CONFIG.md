# Workflow Configuration

This file defines how the workflow integrates with external systems and how humans interact with agents.

---

## Human-in-the-Loop (HITL) Integration

Defines how humans receive notifications and provide approvals at each workflow stage.

### Current Configuration

```yaml
hitl:
  type: cli
  description: "Direct CLI interaction with Claude Code"

  notifications:
    story_ready: "Agent outputs message in CLI"
    review_complete: "Agent outputs message in CLI"
    qa_complete: "Agent outputs message in CLI"

  approvals:
    plan_approval: "User types approval in CLI"
    review_approval: "User types approval in CLI"
    merge_approval: "User types approval in CLI"
```

---

## Workflow Tracks

Defines the three workflow tracks. The human orchestrator selects a track based on the scope of the change.

```yaml
workflow_tracks:
  quick:
    criteria: "Bug fix or chore, < 3 files, no new APIs or components"
    steps: [developer, code-review]
    skip: [user-story-creator, workload-analyst, architect, qa]
    artifacts: "No story file, no plan, no QA report"

  standard:
    criteria: "Feature or refactor, 1-2 phases"
    steps: [story, architect, developer, code-review, qa, retro]
    artifacts: "Story, plan, review(s), QA report(s), retro"

  complex:
    criteria: "Multi-phase feature, 3+ phases, or unfamiliar domain"
    steps: [story, workload-analyst, architect, developer, code-review, qa, retro]
    artifacts: "Story, workload analysis, plan, review(s), QA report(s), devlog(s), retro"
```

---

## Validation Gates

Defines what must pass before transitioning between workflow stages.

```yaml
validation_gates:

  before_code_review:
    required:
      - "npm run build passes"
      - "npm run lint passes with 0 errors"
      - "npm run lint-tsc passes with 0 errors"
      - "npm run test passes"
    recommended:
      - "No TODO comments in new code"

  before_qa:
    required:
      - "Code review approved"
      - "All review feedback addressed"
    recommended:
      - "PR created and CI passing"

  before_merge:
    required:
      - "QA report shows PASS"
      - "All acceptance criteria validated"
      - "CI pipeline green"
    recommended:
      - "Documentation updated if needed"
```

---

## Coverage Expectations

Defines expected test coverage by file type (used by Code Review and QA agents).

```yaml
coverage:

  # Shared utilities, pure functions, helper libraries
  utilities:
    patterns: ["src/lib/**/*.ts", "src/shared/utils/**/*.ts", "src/lib/swap/**/*.ts"]
    target: 90
    blocking: true
    rationale: "Pure functions and utilities should be fully testable"

  # Custom React hooks
  hooks:
    patterns: ["src/shared/hooks/**/*.ts", "src/shared/hooks/**/*.tsx"]
    target: 80
    blocking: true
    rationale: "Hooks contain business logic and should be well tested"

  # API route handlers (Next.js server-side)
  api_routes:
    patterns: ["src/app/api/**/route.ts"]
    target: 80
    blocking: true
    rationale: "API routes are server-side business logic and should be well tested"

  # Zustand state stores
  stores:
    patterns: ["src/shared/stores/**/*.ts"]
    target: 80
    blocking: true
    rationale: "State management logic should be well tested"

  # Reusable UI components
  components:
    patterns: ["src/components/**/*.tsx"]
    target: 70
    blocking: false
    rationale: "Components should have basic render and interaction tests"

  # Page-level components (Next.js App Router)
  pages:
    patterns: ["src/app/**/page.tsx", "src/app/**/page.ts"]
    target: 60
    blocking: false
    rationale: "Page components are integration-heavy; focus on unit testing called hooks/utils"

  # Type definitions and interfaces
  types:
    patterns: ["src/shared/types/**/*.ts", "**/*.d.ts"]
    target: null
    blocking: false
    rationale: "Type definitions have no runtime code"

  # Smart contract ABIs
  abis:
    patterns: ["src/lib/abis/**/*.ts"]
    target: null
    blocking: false
    rationale: "ABIs are constants, no runtime logic to test"

  # Test files themselves
  tests:
    patterns: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts"]
    target: null
    blocking: false
    rationale: "Test files are not measured"
```

---

## Context Management

Defines how agents manage context to prevent degradation over long sessions.

```yaml
context_management:
  fresh_session_per_phase: true
  description: "Each phase starts in a fresh session to prevent context degradation"

  sharding_strategy:
    architect: "Reads full PROJECT.md (only agent that needs everything)"
    developer: "Reads story, current phase from plan, and relevant PROJECT.md sections (Data Fetching, Component Conventions, domain glossary)"
    code_review: "Reads phase diff, devlog, plan; references PROJECT.md on-demand"
    qa: "Reads phase ACs from story, QA template; references PROJECT.md on-demand"

  paste_policy: "NEVER paste full documents. Use file-read tool calls to load only relevant sections."
```
