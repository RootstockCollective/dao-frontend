# ChunkLoadError Analysis and Recommendations

## Issue Summary

**Problem:** Intermittent `ChunkLoadError` occurs when navigating to proposal detail pages, resulting in a full-screen error state with 502 responses from `_next/static/chunks/...`.

**Impact:** Users must click "Try again" or refresh to recover, causing poor UX.

---

## Root Cause

### What is ChunkLoadError?

Next.js splits JavaScript into smaller files called "chunks" for performance. A `ChunkLoadError` occurs when the browser fails to load a required chunk file.

### Why It Happens in Our Setup

```
Timeline of a typical failure:

1. User loads the app
   → Browser caches HTML referencing: chunk-abc123.js

2. New deployment starts (GitHub Actions → ECS rolling update)
   → New containers start with: chunk-def456.js
   → Old containers are terminated

3. User navigates to a new page
   → Browser requests: chunk-abc123.js
   → Server returns 502/404 (file no longer exists)
   → ChunkLoadError thrown
```

### Current Architecture

```
┌─────────────────────────────────────────┐
│           ECS Container                 │
│  ┌─────────────────────────────────┐   │
│  │  Next.js Server (port 3000)     │   │
│  │  - Serves HTML                  │   │
│  │  - Serves _next/static/chunks   │   │  ← Static assets tied to container lifecycle
│  │  - Handles API routes           │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

**Key Issues:**

1. **No CDN** - Static assets served directly from ECS containers
2. **Rolling deployments** - Old containers terminated during update window
3. **Bundled assets** - `output: 'standalone'` ties chunk lifecycle to container lifecycle

---

## Implemented Solution (Client-Side Mitigation)

A client-side solution has been implemented to gracefully handle ChunkLoadError:

### Changes Made

| File                                               | Description                                                      |
| -------------------------------------------------- | ---------------------------------------------------------------- |
| `src/components/ErrorPage/commonErrors.ts`         | Added `isChunkLoadError()` detection and auto-retry logic        |
| `src/components/ErrorPage/GlobalErrorBoundary.tsx` | Enhanced to auto-reload on ChunkLoadError (max 2 attempts)       |
| `src/lib/hooks/useChunkErrorHandler.ts`            | Global error handler to catch chunk errors before React boundary |
| `src/app/providers/ContextProviders.tsx`           | Integrated the chunk error handler                               |

### How It Works

1. Detects ChunkLoadError via error name/message patterns
2. Automatically triggers page reload (fetches fresh chunk manifest)
3. Uses sessionStorage to track attempts (max 2 within 30 seconds)
4. Shows user-friendly "UPDATING..." message during recovery
5. Falls back to error page with "Reload page" button if auto-recovery fails

### Limitations

This is a **mitigation**, not a fix. Users still experience:

- Brief interruption during auto-reload
- Potential loss of in-progress form data
- Multiple reload attempts in worst case

---

## Recommended Infrastructure Solutions

### Option 1: CloudFront CDN + S3 Static Assets (Recommended)

**Effort:** Medium | **Impact:** High | **Cost:** Minimal (~$5-20/month)

```
Improved Architecture:

                    ┌──────────────────┐
     User ─────────▶│   CloudFront     │
                    │   (CDN Cache)    │
                    └────────┬─────────┘
                             │
              ┌──────────────┴──────────────┐
              │                             │
              ▼                             ▼
    ┌─────────────────┐          ┌─────────────────┐
    │  S3 Bucket      │          │  ECS Container  │
    │  _next/static/* │          │  HTML + API     │
    └─────────────────┘          └─────────────────┘
```

**Changes Required:**

1. Create S3 bucket for static assets
2. Create CloudFront distribution with S3 + ECS origins
3. Update `next.config.mjs`:
   ```javascript
   assetPrefix: process.env.CDN_URL || ''
   ```
4. Add CI step to sync static assets to S3:
   ```yaml
   - name: Sync static assets to S3
     run: |
       aws s3 sync .next/static s3://$BUCKET/_next/static \
         --cache-control "public,max-age=31536000,immutable"
   ```

**Benefits:**

- Old chunks remain cached at CDN edge indefinitely
- Reduced load on ECS containers
- Faster asset delivery globally
- Immutable caching (chunks never change, only new ones added)

---

### Option 2: Blue-Green Deployments

**Effort:** Medium | **Impact:** High | **Cost:** +100% ECS during deployment

**How It Works:**

- Maintain two ECS services (blue/green)
- Deploy to inactive environment
- Switch ALB target group atomically
- Keep old environment running for 30-60 minutes

**Benefits:**

- Zero-downtime deployments
- Instant rollback capability
- Old chunks available during transition

**Drawbacks:**

- Double infrastructure during deployment
- More complex deployment orchestration

---

### Option 3: Extended Container Overlap (Quick Win)

**Effort:** Low | **Impact:** Medium | **Cost:** Slightly increased container time

**Changes Required:**
Update ECS service configuration:

```json
{
  "deploymentConfiguration": {
    "minimumHealthyPercent": 100,
    "maximumPercent": 200
  },
  "loadBalancers": [
    {
      "targetGroupArn": "...",
      "containerName": "...",
      "containerPort": 3000
    }
  ]
}
```

Set ALB target group deregistration delay:

```
deregistration_delay.timeout_seconds = 3600  // 1 hour
```

**Benefits:**

- Minimal changes required
- Old containers serve old chunks longer

**Drawbacks:**

- Doesn't fully solve the problem
- Increased cost during longer overlap periods

---

## Comparison Matrix

| Approach          | Effort  | Solves Root Cause | Cost Impact             | Recommended         |
| ----------------- | ------- | ----------------- | ----------------------- | ------------------- |
| CloudFront + S3   | Medium  | ✅ Yes            | ~$5-20/mo               | ✅ Yes              |
| Blue-Green        | Medium  | ✅ Yes            | +100% ECS during deploy | For critical apps   |
| Extended Overlap  | Low     | ⚠️ Partially      | +container hours        | Quick win           |
| Client-side retry | ✅ Done | ⚠️ Mitigates only | None                    | Already implemented |

---

## Recommended Action Plan

### Phase 1: Immediate (Done)

- [x] Client-side ChunkLoadError detection and auto-recovery
- [x] User-friendly error messaging
- [x] Logging for monitoring

### Phase 2: Short-term (Quick Win)

- [ ] Increase ECS deregistration delay to 1 hour
- [ ] Monitor ChunkLoadError frequency in production

### Phase 3: Long-term (Recommended)

- [ ] Set up S3 bucket for static assets
- [ ] Configure CloudFront distribution
- [ ] Update Next.js config with `assetPrefix`
- [ ] Add S3 sync step to CI/CD pipeline
- [ ] Update DNS/routing to use CloudFront

---

## References

- [Next.js Static Asset Prefix Documentation](https://nextjs.org/docs/app/api-reference/next-config-js/assetPrefix)
- [AWS CloudFront + S3 Setup Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStartedCreateDistribution.html)
- [ECS Deployment Configuration](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/deployment-type-ecs.html)

---

## Questions for Discussion

1. Do we have existing CloudFront infrastructure we can leverage?
2. What is the acceptable cost increase for infrastructure changes?
3. Should we implement Phase 2 (quick win) while planning Phase 3?
4. Are there other teams/services that have solved this problem we can learn from?
