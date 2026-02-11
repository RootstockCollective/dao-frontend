# Architecture Plan: STORY-DAO-1908

## [LIKEs] POST Endpoint to Add/Remove Proposal Reaction

**Story:** STORY-DAO-1908
**Author:** Architect Agent
**Date:** 2025-02-11
**Status:** Approved

---

## 1. Summary

Implement the POST `/api/like` endpoint logic in the existing scaffold to persist proposal reactions (toggle add/remove) to the `dao_data.ProposalLikes` table. The route is already protected by `withAuth` and receives JWT-validated sessions. This phase adds Zod validation for `proposalId` and `reaction`, a shared utility to convert proposal IDs to 32-byte BYTEA buffers, and the DB read-then-write toggle logic inside a Knex transaction.

### Key Decisions

- Use a shared `bigIntToBuffer` utility for proposal ID conversion (aligns with PROJECT.md Database Operations).
- Use Zod for request body validation (aligns with PROJECT.md API Route Patterns).
- Use a Knex transaction for the toggle (check-if-exists then insert/delete) to avoid race conditions.
- Phase 1 uses `reaction: 'heart'` only; schema supports future reaction types.

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | POST endpoint adds or removes reaction in the DB | Implement toggle logic: query existing like; if found, delete; else insert. Use `daoDataDb` with `dao_data.ProposalLikes` table. |
| AC-2 | Errors handled gracefully | Return 400 for invalid/missing body; 503 if `daoDataDb` not configured; 500 for unexpected DB errors with sanitized message. |
| AC-3 | Row inserted with user address and reaction when adding; removed when removing | Insert: `{ proposalId, userAddress, reaction }`; delete by unique `(proposalId, userAddress, reaction)`. |
| AC-4 | Endpoint behind authentication | Already satisfied by `withAuth` wrapper (returns 401 on auth failure). |
| AC-5 | Request body has `proposalId` and `reaction` | Zod schema validates both; `reaction` defaults to `'heart'` for phase 1. |
| AC-6 | Response returns success/error and payload | Success: `{ success: true, liked: boolean, userAddress }`; errors per AC-2. |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/lib/daoDataDb.ts` | Modify | Add or document usage — no change if DB client is sufficient. |
| `src/app/api/like/route.ts` | Modify | Replace placeholder with validation, DB logic, and error handling. |
| `src/app/api/utils/proposalId.ts` | Create | Export `bigIntToBuffer(proposalId: string): Buffer` for BYTEA conversion. |
| `src/app/api/like/route.test.ts` | Create | Unit tests for POST handler (mocked `daoDataDb`, `withAuth`). |

---

## 4. Architecture Decisions

### 4.1 Proposal ID as 32-Byte BYTEA

**Decision:** Store `proposalId` as a 32-byte padded hex buffer (BYTEA) in PostgreSQL.

**Rationale:** Matches the schema in `initDaoData.js` and PROJECT.md conventions. Governor proposal IDs are `uint256`; PostgreSQL BYTEA expects consistent length for indexing and uniqueness.

**Pattern Reference:** PROJECT.md § Database Operations — "Store BigInt values as 32-byte padded BYTEA buffers"

**Implementation:**
```typescript
// src/app/api/utils/proposalId.ts
function bigIntToBuffer(value: string): Buffer {
  let hex = BigInt(value).toString(16)
  hex = hex.padStart(64, '0')  // 64 hex chars = 32 bytes = uint256
  return Buffer.from(hex, 'hex')
}
```

### 4.2 Zod Validation for Request Body

**Decision:** Validate `proposalId` and `reaction` with Zod before any DB access.

**Rationale:** Aligns with PROJECT.md API Route Patterns. Catches invalid BigInt strings and ensures `reaction` is a known value (extensible for future types).

**Pattern Reference:** PROJECT.md § API Route Patterns — Validation

**Implementation:**
```typescript
const LikeBodySchema = z.object({
  proposalId: z.string().min(1).refine(val => {
    try { BigInt(val); return true } catch { return false }
  }, 'Invalid proposalId'),
  reaction: z.enum(['heart']).default('heart'),
})
```

### 4.3 Transaction for Toggle (Check Then Insert/Delete)

**Decision:** Wrap the "find existing like → insert or delete" flow in a `daoDataDb.transaction()`.

**Rationale:** Avoids race conditions when multiple requests toggle simultaneously. PROJECT.md explicitly states: "Use `daoDataDb.transaction()` for read-then-write operations."

**Pattern Reference:** PROJECT.md § Database Operations, § Common Pitfalls #5

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA

### Phase 1: POST /api/like — Add/Remove Reaction

**Acceptance Criteria Covered:** AC-1, AC-2, AC-3, AC-4, AC-5, AC-6

**Files to Create/Modify:**
- [ ] `src/app/api/utils/proposalId.ts` — Create `bigIntToBuffer(proposalId: string): Buffer`
- [ ] `src/app/api/like/route.ts` — Replace placeholder with full implementation
- [ ] `src/app/api/like/route.test.ts` — Create unit tests

**Implementation Steps:**
- [ ] **Step 1.1:** Create `src/app/api/utils/proposalId.ts` with `bigIntToBuffer(proposalId: string): Buffer`. Pad hex to 64 chars (32 bytes). Export the function.
- [ ] **Step 1.2:** In `route.ts`, add Zod schema for `{ proposalId: string, reaction: 'heart' }`. Parse body and validate; return 400 with `{ success: false, error }` on failure.
- [ ] **Step 1.3:** Check `daoDataDb` availability. If undefined, return 503 `{ success: false, error: 'Database not configured' }`.
- [ ] **Step 1.4:** Normalize `userAddress` to lowercase. Convert `proposalId` to Buffer via `bigIntToBuffer`.
- [ ] **Step 1.5:** Run toggle logic inside `daoDataDb.transaction()`:
  - Use `daoDataDb.withSchema('dao_data')('ProposalLikes')` to target the correct table.
  - Query for row with `(proposalId, userAddress, reaction)`.
  - If found: delete the row; return `{ success: true, liked: false, userAddress }`.
  - If not found: insert `{ proposalId, userAddress, reaction }`; return `{ success: true, liked: true, userAddress }`.
- [ ] **Step 1.6:** Wrap DB logic in try/catch. On DB error, return 500 with `{ success: false, error: 'Internal server error' }` (dev-only: include `message` with error details).
- [ ] **Step 1.7:** Handle invalid JSON body: if `request.json()` throws or returns non-object, return 400.
- [ ] **Step 1.8:** Remove debug fields (`tester`, `session`, `body`) from success response.

**Tests to Write:**
- [ ] **route.test.ts:** Mock `daoDataDb` and `withAuth` session. Test cases:
  - Valid body, no existing like → inserts row, returns `liked: true`
  - Valid body, existing like → deletes row, returns `liked: false`
  - Missing `proposalId` → 400
  - Invalid `proposalId` (non-numeric) → 400
  - Missing/invalid reaction → 400 (or default to `heart` as per schema)
  - `daoDataDb` undefined → 503
  - DB throws → 500

**Cleanup:**
- [ ] Remove placeholder comments and example code from `route.ts`
- [ ] Update JSDoc to reflect actual request/response shape

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | POST handler validation, DB toggle, error paths | `src/app/api/like/route.test.ts` |

### Testing Approach

- Unit tests co-located: `route.test.ts` next to `route.ts`
- Mock `daoDataDb` with `vi.mock('@/lib/daoDataDb')` — return a Knex-like object with `transaction()`, `table().where().first()`, `table().where().delete()`, `table().insert()`
- `withAuth` already injects session; tests call the inner handler or the wrapped POST with a mocked auth context
- Reference: `src/app/api/health/route.test.ts` for API route test structure
- Environment: `node` (configured via `environmentMatchGlobs` for `**/api/**/*.test.ts`)

### Coverage Targets

- API routes: 80%+ (CONFIG.md)
- Focus on validation, DB logic branches, and error handling

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| `proposalId` format mismatch with Governor | Low | Medium | Validate as BigInt-parseable; ensure 32-byte padding matches schema |
| DB transaction deadlock under load | Low | Medium | Toggle is a single row; keep transaction short |
| `daoDataDb` undefined in some environments | Medium | Low | Return 503 with clear message; migration already logs and continues |
| Future reaction types break enum | Low | Low | Extend Zod `z.enum()` when adding new reactions |

---

## Approval

- [x] Plan reviewed by human
- [x] Approved for implementation
