# PR Review Comments (Updated)

> Only new issues not previously discussed.

---

## src/app/api/auth/verify/route.ts

### Line 56-67 (verifyJWT return type)

````markdown
`verifyJWT()` returns `JWTPayload | null` (object), but this code treats it as returning just `userAddress`. Should be:

```js
const payload = await verifyJWT(token)

if (!payload) {
  return NextResponse.json(
    { valid: false, error: sanitizeError('Invalid or expired token') },
    { status: 401 },
  )
}

return NextResponse.json({
  valid: true,
  userAddress: payload.userAddress,
})
```
````

````

---

# Summary

| File | Issue | Severity |
|------|-------|----------|
| verify/route.ts | verifyJWT return type mismatch | **High** |

---

# Request Changes Message

```markdown
One remaining issue:

**Must fix:**
- `src/app/api/auth/verify/route.ts` (lines 56-67): `verifyJWT()` returns `JWTPayload | null`, but the code treats it as returning just `userAddress`. Extract `.userAddress` from the payload.

Otherwise LGTM!
````
