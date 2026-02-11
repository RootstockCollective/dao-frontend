# Architecture Plan: STORY-DAO-1908

## [LIKEs] Proposal Reaction Endpoint

**Story:** DAO-1908
**Author:** Architect Agent
**Date:** 2026-02-11
**Status:** Approved

---

## 1. Summary

Implement the POST `/api/like` endpoint by replacing the existing placeholder in `src/app/api/like/route.ts` with full toggle logic: validate the request body with Zod, convert the proposal ID to a 32-byte BYTEA buffer, check for an existing reaction in the `ProposalLikes` table within a Knex transaction, and insert or delete accordingly. The endpoint is already wrapped with `withAuth`, so JWT authentication is handled. A co-located unit test will cover success, toggle (unlike), validation errors, and database unavailability.

### Key Decisions
- **Modify existing file only** — the route file, auth middleware, migration, and DB client already exist from DAO-1848/DAO-1849. No new files need to be created except the test file.
- **Knex transaction** — use `daoDataDb.transaction()` for the read-then-write (check existing → insert/delete) to prevent race conditions.
- **proposalId as 32-byte padded BYTEA** — consistent with the codebase convention (`bigIntToBuffer` pattern). The Zod schema validates that the string can be parsed as a BigInt.
- **Toggle behavior** — a single POST endpoint handles both like and unlike. If a matching row exists for `(proposalId, userAddress, reaction)`, it is deleted; otherwise, it is inserted. This maps to the unique constraint in the migration.

---

## 2. Requirements Breakdown

| AC | Requirement | Implementation Approach |
|----|-------------|------------------------|
| AC-1 | POST endpoint is implemented and functional | Replace placeholder in `src/app/api/like/route.ts` with Zod validation, DB query logic, and proper response |
| AC-2 | Errors handled gracefully | Zod validation returns 400 with details; missing DB returns 503; unexpected errors return 500 via `handleApiError` |
| AC-3 | Row inserted with user address, proposal ID, and reaction | `daoDataDb('ProposalLikes').insert(...)` using schema from migration |
| AC-4 | JWT authentication validated via `lib/auth` | Already handled by existing `withAuth` wrapper — no changes needed |
| AC-5 | Toggle behavior (remove if exists) | Query for existing row inside transaction; delete if found, insert if not |

---

## 3. Affected Components

| File | Action | Description |
|------|--------|-------------|
| `src/app/api/like/route.ts` | Modify | Replace placeholder with full implementation (validation, DB logic, responses) |
| `src/app/api/like/route.test.ts` | Create | Unit tests for the POST endpoint |

---

## 4. Architecture Decisions

### 4.1 Single POST Endpoint with Toggle Semantics

**Decision:** Use a single POST endpoint that toggles the reaction (insert if not exists, delete if exists) rather than separate POST/DELETE endpoints.

**Rationale:** The user story specifies "Add the reaction/remove the reaction" via a single endpoint. The existing placeholder code already demonstrates this pattern in its comments. A toggle simplifies the client integration — the frontend sends the same request regardless of current state.

**Pattern Reference:** Matches the placeholder pattern already sketched in the route file.

### 4.2 Zod Validation for Request Body

**Decision:** Use Zod to validate `proposalId` (required string, parseable as BigInt) and `reaction` (enum, defaulting to `'heart'`).

**Rationale:** Follows the established validation pattern in `src/app/api/utils/validators.ts` and vault routes. Zod provides type-safe parsing with clear error messages.

**Pattern Reference:** PROJECT.md § API Route Patterns → Validation.

### 4.3 Knex Transaction for Toggle Logic

**Decision:** Wrap the read-then-write operation in a `daoDataDb.transaction()`.

**Rationale:** Prevents race conditions where two concurrent requests could both read "no existing like" and both insert, violating the unique constraint. PROJECT.md § Common Pitfalls #5 specifically warns about this.

### 4.4 proposalId Conversion to 32-byte BYTEA

**Decision:** Convert the proposalId string to a 32-byte zero-padded Buffer before DB operations.

**Rationale:** The migration stores `proposalId` as `BYTEA NOT NULL`. PROJECT.md § Database Operations specifies: "Store BigInt values as 32-byte padded BYTEA buffers." The `bigIntToBuffer` helper pattern is documented.

---

## 5. Implementation Phases

Each phase goes through the complete cycle: Developer → Code Review → QA

### Phase 1: POST Endpoint Implementation + Tests

**Acceptance Criteria Covered:** AC-1, AC-2, AC-3, AC-4, AC-5

**Files to Create/Modify:**
- [ ] `src/app/api/like/route.ts` — Replace placeholder with full implementation
- [ ] `src/app/api/like/route.test.ts` — Unit tests

**Implementation Steps:**

- [ ] **Step 1.1:** Define Zod schema for request body validation
  ```typescript
  const LikeRequestSchema = z.object({
    proposalId: z.string().min(1, 'proposalId is required').refine(
      val => { try { BigInt(val); return true } catch { return false } },
      'proposalId must be a valid numeric string',
    ),
    reaction: z.enum(['heart']).default('heart'),
  })
  ```

- [ ] **Step 1.2:** Implement `bigIntToBuffer` helper (inline in route file)
  ```typescript
  function bigIntToBuffer(value: string): Buffer {
    let hex = BigInt(value).toString(16)
    hex = hex.padStart(64, '0') // 64 hex chars = 32 bytes = uint256
    return Buffer.from(hex, 'hex')
  }
  ```

- [ ] **Step 1.3:** Replace the POST handler body with:
  1. Check `daoDataDb` availability → 503 if undefined
  2. Parse and validate request body with Zod → 400 on failure
  3. Convert `proposalId` to Buffer via `bigIntToBuffer`
  4. Normalize `userAddress` to lowercase
  5. Inside `daoDataDb.transaction()`:
     - Query `ProposalLikes` for existing row matching `(proposalId, userAddress, reaction)` using schema-qualified table `dao_data.ProposalLikes`
     - If exists → DELETE → return `{ success: true, liked: false }`
     - If not → INSERT → return `{ success: true, liked: true }`
  6. Catch errors → 500 via pattern from `handleApiError`

- [ ] **Step 1.4:** Write unit tests covering:
  - Successful like (insert) → 200, `liked: true`
  - Successful unlike (toggle/delete) → 200, `liked: false`
  - Missing/invalid `proposalId` → 400 with Zod error details
  - Invalid `reaction` value → 400
  - Database not configured → 503
  - Database error → 500
  - Authentication failure → 401 (handled by `withAuth`, mock `requireAuth` to throw)

**Tests to Write:**
- [ ] `route.test.ts` — POST /api/like: returns 200 with `liked: true` when inserting new reaction
- [ ] `route.test.ts` — POST /api/like: returns 200 with `liked: false` when toggling existing reaction
- [ ] `route.test.ts` — POST /api/like: returns 400 when proposalId is missing
- [ ] `route.test.ts` — POST /api/like: returns 400 when proposalId is not a valid BigInt
- [ ] `route.test.ts` — POST /api/like: returns 400 when reaction is invalid
- [ ] `route.test.ts` — POST /api/like: returns 503 when database is not configured
- [ ] `route.test.ts` — POST /api/like: returns 401 when not authenticated
- [ ] `route.test.ts` — POST /api/like: returns 500 on database error
- [ ] `route.test.ts` — POST /api/like: normalizes userAddress to lowercase

**Cleanup:**
- [ ] Remove all placeholder comments from route.ts

---

## 6. Testing Strategy

| Phase | Test Type | Test Focus | Key Files |
|-------|-----------|------------|-----------|
| Phase 1 | Unit (Vitest) | Endpoint logic, validation, DB operations, error handling | `src/app/api/like/route.test.ts` |

### Testing Approach
- Unit tests co-located with source file (`route.test.ts` alongside `route.ts`)
- Mock `daoDataDb` module to control database behavior
- Mock `requireAuth` from `@/lib/auth/session` to simulate authenticated/unauthenticated requests
- Use `NextRequest` to construct test requests (following pattern in `src/app/api/` existing tests)
- API route tests use `node` environment (configured via `environmentMatchGlobs` in `vitest.config.ts`)

### Mock Strategy
```typescript
vi.mock('@/lib/daoDataDb', () => ({ daoDataDb: mockDb }))
vi.mock('@/lib/auth/session', () => ({ requireAuth: vi.fn() }))
```

### Coverage Targets
Reference: `.workflow/CONFIG.md` — API routes target: **80%** (blocking)

---

## 7. Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Race condition on concurrent toggle | Low | Medium | Use Knex transaction; unique constraint as safety net |
| proposalId format mismatch with existing data | Low | High | Use same `bigIntToBuffer` pattern as documented; validate with BigInt parsing |
| Schema not found (search_path issue) | Low | Medium | Use schema-qualified table name `dao_data.ProposalLikes` in Knex queries |
| BYTEA type parser inconsistency | Low | Low | pg type parser already configured in `daoDataDb.ts`; test with Buffer comparisons |

---

## Approval

- [ ] Plan reviewed by human
- [ ] Approved for implementation
