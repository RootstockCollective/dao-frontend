# DAO-1908: [LIKEs] Proposal Reaction Endpoint

## Status
- [ ] Draft
- [ ] Ready for Development
- [ ] In Architecture
- [ ] In Development
- [ ] In Review
- [x] In QA
- [ ] Done

## Description

Implement a POST endpoint to add or remove proposal reactions (likes) in the database. This endpoint enables users to express reactions on proposals, starting with a heart reaction and expanding to additional reaction types in future phases.

This work builds on the database schema established in [DAO-1848: [LIKEs] Database Schema Setup](https://rsklabs.atlassian.net/browse/DAO-1848) and requires JWT authentication implemented in [DAO-1849: [LIKEs] Authentication flow for LIKEs](https://rsklabs.atlassian.net/browse/DAO-1849).

The endpoint should:
- Be a POST request protected behind authentication
- Authenticate the user using JWT via the existing `lib/auth` check
- Receive the proposal ID and reaction type in the request body
- Toggle behavior: add the reaction if it doesn't exist, remove it if it already exists
- Store the user's address (extracted from JWT), proposal ID, and reaction type in the database

## Acceptance Criteria

- [ ] AC-1: POST endpoint is implemented and functional
- [ ] AC-2: Errors are handled gracefully (invalid proposal ID, invalid reaction type, unauthorized requests, database errors)
- [ ] AC-3: A row is inserted in the DB containing the user address, proposal ID, and the reaction
- [ ] AC-4: JWT authentication is validated via `lib/auth` before processing the request
- [ ] AC-5: If the reaction already exists for the user/proposal combination, it is removed (toggle behavior)

## Technical Notes

- Depends on DAO-1848 (database schema) and DAO-1849 (JWT authentication flow)
- Initial reaction type is "heart"; the reaction field should be flexible for future reaction types
- User address is extracted from the authenticated JWT token
- Endpoint should follow existing API patterns in the codebase

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
- Status: [x] Pending | [ ] Approved | [ ] Rejected

### Code Review
- PR: #[number]
- File: `../reviews/STORY-DAO-1908-review.md`
- Status: [ ] Pending | [x] Approved | [ ] Changes Requested

### QA Report
- File: `../qa-reports/STORY-DAO-1908-phase-1-qa.md`
- Status: [ ] Pending | [x] Passed | [ ] Failed
