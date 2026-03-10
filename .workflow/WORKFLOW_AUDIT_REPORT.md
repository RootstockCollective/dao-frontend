# Workflow Audit Report

**Date:** 2026-03-05
**Scope:** `.workflow/` system + `.cursor/rules/` integration
**Purpose:** Identify structural gaps and conceptual issues in the current AI-assisted development workflow, grounded in authoritative industry sources.

---

## 1. Current Workflow Summary

The workflow follows a phased, human-supervised pipeline:

```
Story → Workload Analyst → Architect → [Developer → Code Review → QA] × N → Merge
```

Key properties:
- `.cursor/rules/*.mdc` files serve as canonical coding standards (auto-loaded by Cursor IDE)
- `.workflow/agents/` contains prompt templates for each role
- Human approval gates at 4 points: story, plan, review, QA
- Phases are sized small (1-3 ACs, one layer, <5 files)
- Agents reference `.cursor/rules/` rather than duplicating standards

---

## 2. What the Workflow Gets Right

### 2.1 Two-layer standards architecture

`.cursor/rules/` files are always-applied by Cursor for every AI interaction (chat, composer, agent). The workflow agents reference them as canonical source. This means standards are enforced even outside the formal workflow -- quick fixes, ad-hoc changes, and code reviews all benefit.

> **Supporting evidence:** ThoughtWorks identifies "context engineering" as the practice of curating what the model sees to get better results, with rules files being the foundational layer.
> — Fowler, M. (2026). "Context Engineering for Coding Agents." martinfowler.com

### 2.2 Phase-by-phase execution with sizing constraints

The 1-3 ACs per phase, one-layer-per-phase, <5-files constraints prevent oversized PRs and maintain reviewability.

> **Supporting evidence:** OpenAI's harness engineering team found that constraining the solution space -- specific patterns, enforced boundaries, standardized structures -- was necessary for maintainable AI-generated code at scale.
> — OpenAI (2026). "Harness Engineering: Leveraging Codex in an Agent-First World." openai.com

### 2.3 Human-in-the-loop at critical points

Four approval gates prevent autonomous drift without creating bottleneck overhead.

> **Supporting evidence:** Fowler describes this as the "on the loop" model -- humans build and maintain the harness rather than inspecting every line or leaving agents unsupervised. "The difference is what we do when we're not satisfied... The 'on the loop' way is to change the harness that produced the artefact so it produces the results we want."
> — Fowler, M. (2026). "Humans and Agents in Software Engineering Loops." martinfowler.com

### 2.4 Comprehensive domain context in PROJECT.md

The 900-line PROJECT.md provides domain glossary, user personas, smart contract references, and code conventions. This prevents agents from making incorrect assumptions about domain-specific terminology.

> **Supporting evidence:** Anthropic's best practices state that referencing specific files, mentioning constraints, and pointing to example patterns produces dramatically fewer correction cycles.
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

---

## 3. Structural Gaps

### 3.1 No context reset strategy

**Problem:** The workflow is silent on when to start fresh context. Each agent prompt says "[PASTE THE CONTENTS OF .workflow/PROJECT.md HERE]" -- loading 900+ lines into every session. By phase 3 of a complex story, accumulated context (PROJECT.md + story + plan + previous phase outputs + conversation) fills the window and quality silently drops.

**Evidence:**

> "Most best practices are based on one constraint: Claude's context window fills up fast, and performance degrades as it fills."
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

> "If you've corrected Claude more than twice on the same issue in one session, the context is cluttered with failed approaches. Run /clear and start fresh with a more specific prompt."
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

> Role specialization degrades after ~15-20 iterations in multi-agent setups. "Incremental context accumulation may dilute initial role constraints."
> — gagarinyury (2026). GitHub Issue #24256, anthropics/claude-code. (First-hand observation with reproduction steps; labeled "stale" -- Anthropic has not officially responded.)

**Recommendation:** Each phase should start in a fresh session. PROJECT.md should not be pasted wholesale -- extract only the sections relevant to the current phase (e.g., "Data Fetching Patterns" for a hooks phase). Add a `## Context Budget` section to each agent defining what goes into context and what gets referenced on-demand.

---

### 3.2 No implementation log or decision record

**Problem:** The workflow produces plans, reviews, and QA reports, but nothing records what actually happened during implementation. When the Developer agent deviates from the plan, there is no record of why.

**Evidence:**

> "Nothing flows from implementation back to knowledge... Every feature I ship quietly widening the gap between what's documented and what's real."
> — Royz, S. (2026). "Agentic Development Distilled." Medium. (CTO with 15+ years experience, first-hand account of building a plans-based agentic workflow.)

> "When the agent struggles, we treat it as a signal: identify what is missing — tools, guardrails, documentation — and feed it back into the repository, always by having Codex itself write the fix."
> — OpenAI (2026). "Harness Engineering." openai.com

**Recommendation:** After each phase, the Developer agent writes a `STORY-XXX-phase-N-devlog.md` capturing: deviations from plan, unexpected findings, assumptions made, tech debt created. This becomes input for the Code Review agent.

---

### 3.3 Static specs with no update mechanism

**Problem:** The plan is written once by the Architect and never updated. When reality diverges from the plan during implementation, there is no mechanism to reconcile.

**Evidence:**

> "A stale spec misleads agents that don't know any better. They'll execute a plan that no longer matches reality, confidently, and they won't flag that anything is wrong."
> — Wattenberger, A. (2026). "What Spec-Driven Development Gets Wrong." Augment Code blog. (Author is former Principal Research Engineer on GitHub's Next team; article is also a product pitch for Augment's "Intent" product -- trust the problem diagnosis, be skeptical of the implied solution being the only path.)

> ThoughtWorks Technology Radar Vol. 33 (Nov 2025) placed "Anchoring coding agents to a reference application" in the Assess ring, recommending live, compilable reference code over static prompt examples.
> — ThoughtWorks (2025). Technology Radar Vol. 33. thoughtworks.com/radar

**Recommendation:** Add a `## Plan Amendments` section to the plan template. The Developer agent should have instructions to update the plan when reality diverges. The Code Review agent should verify: "does the plan still reflect what was built?"

---

### 3.4 No quick flow escape hatch

**Problem:** The workflow has one speed. A one-line bug fix goes through the same ceremony as a multi-phase feature. This will cause developers to bypass the workflow entirely for small changes.

**Evidence:**

> Anthropic's own best practices distinguish when planning is needed vs. not: "Planning is most useful when you're uncertain about the approach, when the change modifies multiple files, or when you're unfamiliar with the code being modified. If you could describe the diff in one sentence, skip the plan."
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

> The BMAD Method includes a "Quick Flow" parallel track for small, well-understood work: `bmad-bmm-quick-spec` → `bmad-bmm-quick-dev`, skipping phases 1-3 entirely.
> — BMAD Method (2026). docs.bmad-method.org/reference/workflow-map. (Open-source framework; trust the workflow structure, be skeptical of quantitative claims.)

**Recommendation:** Add a triage step to CONFIG.md defining workflow tracks:
- **Quick** (bug fix, <3 files): Developer → Code Review only.
- **Standard** (1-2 phases): full pipeline.
- **Complex** (3+ phases): adds Workload Analyst upstream.

---

### 3.5 No retrospective or feedback loop

**Problem:** After a story is merged, the workflow ends. There is no mechanism to capture what worked, what failed, and what should change in the workflow itself.

**Evidence:**

> Fowler describes the "agentic flywheel": humans direct agents to evaluate the performance of the loop and recommend improvements to the harness. "We continuously improve the quality of the outcomes we get by continuously improving the harness."
> — Fowler, M. (2026). "Humans and Agents in Software Engineering Loops." martinfowler.com

> OpenAI's harness engineering approach treats agent struggles as signals to improve the harness: "identify what is missing... and feed it back into the repository."
> — OpenAI (2026). "Harness Engineering." openai.com

> The BMAD Method includes `bmad-bmm-retrospective` as a standard workflow step after epic completion.
> — BMAD Method (2026). docs.bmad-method.org/reference/workflow-map

**Recommendation:** Add a lightweight retro step after merge. Record: phases that needed rework, agent failure modes, `.cursor/rules/` gaps discovered, plan accuracy vs. reality. Store in `.workflow/retros/STORY-XXX-retro.md`. Periodically review retros to update rules and agent prompts.

---

### 3.6 Agents are paste-based prompts, not executable

**Problem:** Agent files contain prompts with "[PASTE THE CONTENTS OF .workflow/PROJECT.md HERE]". The human must manually open the agent file, copy the prompt, paste context documents, and run it. This friction reduces adoption.

**Evidence:**

> Anthropic's custom sub-agents feature allows defining agents as markdown files with YAML frontmatter in `.claude/agents/`, automatically loaded with their own context window, tool restrictions, and model selection. Sub-agents can be invoked by name and run in isolated context.
> — Anthropic (2026). "Create Custom Subagents." docs.anthropic.com/en/docs/claude-code/sub-agents

> Cursor supports `.cursor/rules/` with auto-injection. Cursor also now supports sub-agents (as of early 2026).
> — Fowler, M. (2026). "Context Engineering for Coding Agents." martinfowler.com

**Recommendation (near-term):** Replace "[PASTE HERE]" instructions with explicit file-reading tool calls in agent prompts (e.g., "Read `.workflow/PROJECT.md` and `.workflow/stories/STORY-XXX.md`").

**Recommendation (medium-term):** Evaluate converting agents to Cursor sub-agents or Claude Code custom agents (`.claude/agents/`) for automatic context loading.

---

## 4. Conceptual Issues

### 4.1 Duplicative agent responsibilities

**Problem:** The Code Review agent checks things that `.cursor/rules/` already enforces in real-time (import ordering, naming conventions), and re-runs the same validation gate (`npm run build/lint/test`) the Developer already passed. This is redundant token spend.

**Evidence:**

> Anthropic advises using the harness (hooks, linters, tests) for deterministic checks rather than LLM-based review: "Unlike CLAUDE.md instructions which are advisory, hooks are deterministic and guarantee the action happens."
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

**Recommendation:** Make each agent additive, not duplicative:
- **Developer**: implements + runs validation gate (deterministic checks).
- **Code Review**: focuses on architectural fit, business logic correctness, security -- things linters cannot catch. Remove the coding-standards compliance checklist (the linter and rules already handle this).
- **QA**: focuses on acceptance criteria validation and integration correctness. Remove "run build/lint/test" steps.

---

### 4.2 All-upfront architecture with no uncertainty markers

**Problem:** The Architect analyzes everything upfront and produces a complete plan. This works for well-understood features but fails for exploratory work where the right approach isn't known until implementation.

**Evidence:**

> Anthropic's own workflow recommends "Explore first, then plan, then code" -- but treats planning as appropriately scoped to certainty level. "Planning is most useful when you're uncertain about the approach."
> — Anthropic (2026). "Best Practices for Claude Code." docs.anthropic.com

> Fowler distinguishes the "why loop" (what to build) from the "how loop" (how to build it), noting that constraining the how loop too rigidly can prevent discovery: "The appeal of humans staying out of the how loop is that the why loop is the one we really care about."
> — Fowler, M. (2026). "Humans and Agents in Software Engineering Loops." martinfowler.com

**Recommendation:** Allow the Architect to mark phases as speculative with a confidence level and decision point. Example: "Phase 3 [Speculative, Low Confidence]: depends on whether the DEX API supports batch queries. Decision point: after Phase 2, evaluate whether to proceed or pivot."

---

### 4.3 No explicit orchestrator

**Problem:** The README says "use the prompt in agents/architect.md" but does not define who decides when to transition between stages. The human is the implicit orchestrator, reducing the workflow to a collection of prompt templates.

**Evidence:**

> Fowler's "on the loop" model explicitly requires defining who manages the loop: "Rather than personally inspecting what the agents produce, we can make them better at producing it."
> — Fowler, M. (2026). "Humans and Agents in Software Engineering Loops." martinfowler.com

**Recommendation:** Add an explicit Orchestrator section to the README documenting the human's role as orchestrator. Include a checklist in each story file that the human checks off as they progress through stages. This makes the implicit explicit and creates a path toward future automation.

---

## 5. Source Registry

### Tier 1: Vendor Primary Documentation

| Source | URL | Why Trust It |
|--------|-----|--------------|
| Anthropic: "Best Practices for Claude Code" | [docs.anthropic.com/en/docs/claude-code/best-practices](https://docs.anthropic.com/en/docs/claude-code/best-practices) | Vendor's own docs. They know how their model behaves. Patterns "proven effective across Anthropic's internal teams." |
| Anthropic: "Create Custom Subagents" | [docs.anthropic.com/en/docs/claude-code/sub-agents](https://docs.anthropic.com/en/docs/claude-code/sub-agents) | Official product specification for sub-agent architecture. |

### Tier 2: Industry Thought Leaders

| Source | URL | Why Trust It |
|--------|-----|--------------|
| Fowler, M. "Context Engineering for Coding Agents" (Jan 2026) | [martinfowler.com/.../context-engineering-coding-agents.html](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html) | ThoughtWorks technologist. martinfowler.com has been an industry reference for 25+ years. Part of a structured "Exploring Gen AI" series. |
| Fowler, M. "Harness Engineering" (Feb 2026) | [martinfowler.com/.../harness-engineering.html](https://martinfowler.com/articles/exploring-gen-ai/harness-engineering.html) | Independent analysis of OpenAI's harness engineering write-up. Identifies gaps (no behavioral verification) that their own post glosses over. |
| Fowler, M. "Humans and Agents in Software Engineering Loops" (Mar 4, 2026) | [martinfowler.com/.../humans-and-agents.html](https://martinfowler.com/articles/exploring-gen-ai/humans-and-agents.html) | Most recent article. Introduces the in/on/outside-the-loop framework. Directly validates the "on the loop" model this workflow attempts. |
| ThoughtWorks Technology Radar Vol. 33 (Nov 2025) | [thoughtworks.com/radar/techniques/anchoring-coding-agents-to-a-reference-application](https://www.thoughtworks.com/radar/techniques/anchoring-coding-agents-to-a-reference-application) | Biannual publication reviewed by ThoughtWorks' technology advisory board. Used by thousands of engineering organizations. |

### Tier 3: Company Engineering Blogs

| Source | URL | Why Trust It | Caveats |
|--------|-----|--------------|---------|
| OpenAI: "Harness Engineering" (Feb 2026) | [openai.com/index/harness-engineering/](https://openai.com/index/harness-engineering/) | First-hand account with specific numbers: 1M lines, 1500 PRs, 5 months, 3-7 engineers. Details are concrete enough to be falsifiable. Independently analyzed by Fowler. | Vendor writing about their own product. Marketing incentive exists. |
| Shopify AI Policy (Apr 2025) | [shopify.com/careers/candidate-guide/ai-usage](https://shopify.com/careers/candidate-guide/ai-usage) | CEO-level mandate at 8,100-employee company. Validates organizational commitment to AI-assisted development. | Policy document, not a technical workflow guide. |

### Tier 4: Practitioner Accounts

| Source | URL | Why Trust It | Caveats |
|--------|-----|--------------|---------|
| Royz, S. "Agentic Development Distilled" (Feb 2026) | [zjor.medium.com](https://zjor.medium.com/agentic-development-distilled-what-i-got-right-what-broke-and-the-process-that-fixed-it-4bf9dac7bf4f) | CTO with 15+ years experience. Honest account of what broke in his plans-based workflow. | Single practitioner's experience. Medium post, no peer review. |
| Wattenberger, A. "What SDD Gets Wrong" (2026) | [augmentcode.com/blog/what-spec-driven-development-gets-wrong](https://www.augmentcode.com/blog/what-spec-driven-development-gets-wrong) | Author was Principal Research Engineer on GitHub's Next team. Problem diagnosis is credible. | Also a sales pitch for Augment's "Intent" product. Trust the diagnosis, not the implied solution. |
| GitHub Issue #24256 (Feb 2026) | [github.com/anthropics/claude-code/issues/24256](https://github.com/anthropics/claude-code/issues/24256) | Detailed reproduction steps. Quantified observations (15-20 iterations, 10-20 MB config growth). | Single user. Labeled "stale" by Anthropic bot -- no official response. |

### Tier 5: Peer-Reviewed Research

| Source | URL | Why Trust It | Caveats |
|--------|-----|--------------|---------|
| Microsoft Research: GitHub Copilot RCTs (2023-2024) | [microsoft.com/en-us/research/publication/the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot/](https://www.microsoft.com/en-us/research/publication/the-impact-of-ai-on-developer-productivity-evidence-from-github-copilot/) | Randomized controlled trials with 1,974 developers. Found 12.9-21.8% more PRs/week. | Measures autocomplete tools (Copilot), not agentic workflows. Researchers note results may not generalize. |
| MIT/NBER Field Experiment (2024) | [mit-genai.pubpub.org/pub/v5iixksv](https://mit-genai.pubpub.org/pub/v5iixksv/release/2) | Academic field experiment. 26% throughput gains. | Same caveat: measures simpler AI assistance, not multi-agent pipelines. |

### Frameworks Referenced

| Source | URL | Why Trust It | Caveats |
|--------|-----|--------------|---------|
| BMAD Method | [docs.bmad-method.org](https://docs.bmad-method.org/reference/workflow-map/) | Open-source framework with documented workflows, phases, and slash commands. Closest comparable system. | Framework selling itself. Quantitative claims (e.g., "90% token reduction") are marketing, not measured. |

---

## 6. What is NOT in the Literature

No peer-reviewed research exists on multi-agent development workflows as of March 2026. The field is 12-18 months old. The strongest guidance available comes from:
1. Vendor documentation (Anthropic knows how their model behaves)
2. Thought leader analysis (Fowler/ThoughtWorks bring decades of credibility and independence)
3. First-hand engineering accounts (OpenAI, individual practitioners)

Claims about "40-60% fewer revision cycles" or "90% token reduction" that appear in framework marketing should be treated as unsubstantiated.

---

## 7. Priority Roadmap

| # | Gap | Effort | Impact | Primary Source |
|---|-----|--------|--------|----------------|
| 1 | Quick flow escape hatch (3.4) | Low | High | Anthropic best practices, BMAD |
| 2 | Bidirectional specs / plan amendments (3.3) | Low | High | Wattenberger (Augment), ThoughtWorks Radar |
| 3 | Context reset strategy (3.1) | Medium | High | Anthropic best practices, GH #24256 |
| 4 | De-duplicate agent responsibilities (4.1) | Medium | Medium | Anthropic (hooks > advisory rules) |
| 5 | Implementation logs (3.2) | Low | Medium | Royz, OpenAI harness engineering |
| 6 | Make agents executable (3.6) | Medium | High | Anthropic sub-agents docs |
| 7 | Retrospective / feedback loop (3.5) | Low | Medium | Fowler (agentic flywheel), OpenAI, BMAD |
| 8 | Speculative phases (4.2) | Low | Low | Anthropic best practices, Fowler |
| 9 | Explicit orchestrator (4.3) | Low | Medium | Fowler (on-the-loop model) |
