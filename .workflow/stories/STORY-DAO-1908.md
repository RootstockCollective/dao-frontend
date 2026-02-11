# STORY-DAO-1908: [LIKEs] POST Endpoint to Add/Remove Proposal Reaction

## Status
- [ ] Draft
- [x] Ready for Development
- [x] In Architecture
- [ ] In Development
- [ ] In Review
- [ ] In QA
- [ ] Done

## Description

Implement a POST endpoint that persists proposal likes/reactions to the database. This endpoint will allow authenticated users to add or remove their reaction (heart in the first phase) on a proposal.

**Context:**
- This work correlates with [DAO-1848: [LIKEs] Database Schema Setup](https://rsklabs.atlassian.net/browse/DAO-1848), which established the `ProposalLikes` table in the `dao_data` schema.
- Authentication is provided by [DAO-1849: [LIKEs] Authentication flow for LIKEs](https://rsklabs.atlassian.net/browse/DAO-1849), which delivers a JWT for verified user sessions.

The endpoint will:
- Validate the JWT (via `lib/auth` / `withAuth`)
- Accept `proposalId` and `reaction` in the request body
- Toggle the reaction: insert a row when the user adds a reaction, delete the row when they remove it
- Persist `userAddress` and `reaction` in the `ProposalLikes` table

**First phase:** The reaction type is a heart. Reaction types may change in future phases.

## Acceptance Criteria

- [ ] AC-1: POST endpoint is functional and correctly adds or removes the user's reaction in the database
- [ ] AC-2: Errors are handled gracefully (invalid body, missing proposalId/reaction, DB errors, auth failures) with appropriate status codes and error messages
- [ ] AC-3: A row is inserted in the DB containing the user address and the reaction when adding; the row is removed when the user removes the reaction
- [ ] AC-4: Endpoint is behind authentication (JWT validation via `lib/auth` check)
- [ ] AC-5: Request body includes `proposalId` (string) and `reaction` (string; first phase: heart)
- [ ] AC-6: Response returns success/error status and relevant payload (e.g., liked/unliked, userAddress)

## Technical Notes

- **Auth:** Use `withAuth` from `@/lib/auth/withAuth` to protect the route. JWT is created in DAO-1849.
- **Schema:** `dao_data.ProposalLikes` table (DAO-1848) with columns: `id`, `proposalId` (BYTEA), `userAddress` (VARCHAR 42), `likedAt`, `reaction` (VARCHAR 50). Unique constraint on `(proposalId, userAddress, reaction)`.
- **DB:** Use `DAO_DATA_DB_CONNECTION_STRING`; dao data DB is separate from state-sync.
- **Existing scaffold:** `src/app/api/like/route.ts` already has `POST` with `withAuth`; implement the DB logic in place of the placeholder.
- **Reaction:** Phase 1 uses heart; design for extensibility (reaction may change later).

## Related Tickets

- [DAO-1848](https://rsklabs.atlassian.net/browse/DAO-1848): Database Schema Setup
- [DAO-1849](https://rsklabs.atlassian.net/browse/DAO-1849): Authentication flow for LIKEs

## Priority

- [ ] Critical
- [x] High
- [ ] Medium
- [ ] Low

## Estimated Size

- [x] S (< 1 day)
- [ ] M (1-3 days)
- [ ] L (3-5 days)
- [ ] XL (> 5 days)

---

## Workflow Artifacts

### Architecture Plan
- File: `../plans/STORY-DAO-1908-plan.md`
- Status: [ ] Pending | [x] Approved | [ ] Rejected

### Code Review
- PR: #[number]
- File: `../reviews/STORY-DAO-1908-phase-1-review.md`
- Status: [ ] Pending | [x] Approved | [ ] Changes Requested

### QA Report
- File: `../qa-reports/STORY-DAO-1908-qa.md`
- Status: [ ] Pending | [ ] Passed | [ ] Failed
