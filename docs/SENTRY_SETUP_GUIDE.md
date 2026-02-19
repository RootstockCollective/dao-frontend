# Sentry Setup Guide

This guide explains how to configure Sentry error tracking for the Rootstock DAO Frontend.

## Prerequisites

- A [Sentry](https://sentry.io) account
- Access to create projects in your Sentry organization

## 1. Create a Sentry Project

1. Log in to [sentry.io](https://sentry.io)
2. Select your organization (or create one)
3. Go to **Projects** → **Create Project**
4. Choose **Next.js** as the platform
5. Name the project (e.g. `rootstock-dao-frontend`)
6. Click **Create Project**

## 2. Obtain the DSN

The DSN (Data Source Name) is the URL Sentry uses to receive error events.

1. In the Sentry dashboard, go to **Settings** → **Projects** → select your project
2. In the left sidebar, click **Client Keys (DSN)**
3. Copy the **DSN** value. It looks like:
   ```
   https://<key>@<org-id>.ingest.us.sentry.io/<project-id>
   ```

Alternatively:

1. Go to **Settings** → **Projects** → your project
2. Click **Client Keys (DSN)** under the **Security & Privacy** section
3. Copy the DSN from the displayed configuration

## 3. Configure Environment Variables

Add these to your `.env.*` file (e.g. `.env.testnet.local`):

```env
# Features (set to true to enable)
NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true
NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_REPLAY=false

# Sentry
NEXT_PUBLIC_SENTRY_DSN=https://<your-key>@<org-id>.ingest.us.sentry.io/<project-id>
SENTRY_ORG=rootstock-labs
SENTRY_PROJECT=rootstock-dao-frontend
```

| Variable | Where to get it |
| -------- | ---------------- |
| `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING` | Feature flag for error tracking. Set to `true` to enable |
| `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_REPLAY` | Feature flag for session replay. Set to `true` to record user sessions when errors occur (default: `false`) |
| `NEXT_PUBLIC_SENTRY_DSN` | Client Keys (DSN) in project settings |
| `SENTRY_ORG` | Organization slug from URL: `sentry.io/organizations/<org-slug>/` |
| `SENTRY_PROJECT` | Project name from project settings |

## 4. Generate SENTRY_AUTH_TOKEN (for Source Maps)

The auth token is used during build to upload source maps for readable stack traces. **Optional**: without it, Sentry still captures errors but stack traces remain minified and unreadable.

1. In Sentry, go to **Settings** → **Auth Tokens**
   - Direct link: `https://sentry.io/settings/<org-slug>/auth-tokens/`
2. Click **Create New Token**
3. Configure:
   - **Name**: e.g. `DAO Frontend Build`
   - **Scopes**: Select at least:
     - `project:read`
     - `project:releases`
     - `org:read`
   - **Expiration**: Choose a duration or "No expiration"
4. Click **Create Token**
5. **Copy the token immediately** — it is shown only once

**Security**: Never commit the auth token to the repository. Use:
- `.env.sentry-build-plugin` (gitignored) for local builds, or
- CI/CD secrets (e.g. GitHub Actions) for production builds

## 5. Local Build with Source Maps

For local development builds with source map upload:

1. Create `.env.sentry-build-plugin` in the project root (if not using CI):
   ```env
   SENTRY_AUTH_TOKEN=your_token_here
   SENTRY_ORG=rootstock-labs
   SENTRY_PROJECT=rootstock-dao-frontend
   ```
2. Ensure this file is in `.gitignore`
3. Run `npm run build` — source maps will be uploaded to Sentry

## 6. CI/CD Configuration

For GitHub Actions or other CI:

1. Add `SENTRY_AUTH_TOKEN` as a repository secret
2. Pass it to the build as a build-arg or environment variable
3. Ensure `SENTRY_ORG` and `SENTRY_PROJECT` are available during build

Example (GitHub Actions):

```yaml
env:
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
  SENTRY_ORG: rootstock-labs
  SENTRY_PROJECT: rootstock-dao-frontend
```

## 7. Session Replay (Optional)

Session replay records user sessions when errors occur, helping debug issues with video-like playback.

- Set `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_REPLAY=true` to enable
- Requires `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true` to be enabled first
- When enabled: 10% of sessions are recorded; 100% of sessions with errors are recorded
- Disabled by default to reduce data and cost

## 8. Verify Setup

1. Set `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true`
2. Run the app and trigger a test error (e.g. visit `/test-sentry` if available)
3. Check the Sentry dashboard for the new event
4. Optionally enable `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_REPLAY=true` to verify replay

## Troubleshooting

| Issue | Solution |
| ----- | -------- |
| No events in Sentry | Verify `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_ERROR_TRACKING=true` and DSN is set |
| No session replays | Set `NEXT_PUBLIC_ENABLE_FEATURE_SENTRY_REPLAY=true` (error tracking must be enabled first) |
| Source maps not uploading | Ensure `SENTRY_AUTH_TOKEN` is set during build with correct scopes |
| CORS/network errors not captured | These require explicit capture; see instrumentation and axios interceptors |
| Feature flag not working | Check the feature flag is in the correct `.env.*` for your `PROFILE` |

## References

- [Sentry Next.js Documentation](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Sentry Auth Tokens](https://docs.sentry.io/product/accounts/org-auth-tokens/)
