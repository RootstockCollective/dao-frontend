/**
 * Resolves which Blockscout API answers our RPC-style (`module=`/`action=`) calls.
 *
 * Public explorer instances (`rootstock.blockscout.com`) are bot-protected: measured against
 * mainnet, an unauthenticated caller gets **10 requests per ~16-minute window per IP**, after which
 * every request is a hard 429 until the window resets. That is ~0.01 req/s, orders of magnitude
 * below what the gauge routes need, and it is why they answered 504.
 *
 * The PRO API (`api.blockscout.com`) serves the same endpoints behind a real quota: one host for
 * every chain, selected with `chain_id`, authenticated with `apikey`.
 *
 * @remarks
 * - **Opt-in.** With no key configured we keep calling the public instance, so environments without
 *   one behave exactly as before rather than failing closed.
 * - **Server-only.** {@link BLOCKSCOUT_API_KEY} is deliberately *not* a `NEXT_PUBLIC_` variable —
 *   that would ship the key to every browser. Only import this from server code.
 * - Scope is the RPC-style API. REST v2 callers (`/api/v2/addresses/…` in `rns.ts`, `Balances`) and
 *   the browser-side `fetchEpochSettledLogs` still use `NEXT_PUBLIC_BLOCKSCOUT_URL`, which also
 *   remains the explorer origin for UI links (see `src/config/config.ts`). Do not repoint it.
 */
import { BLOCKSCOUT_URL, CHAIN_ID } from '@/lib/constants'

/** Multichain PRO API base. `/api` is appended by callers, giving `…/v2/api?chain_id=…`. */
const DEFAULT_PRO_API_URL = 'https://api.blockscout.com/v2'

const apiKey = process.env.BLOCKSCOUT_API_KEY?.trim()
const proApiUrl = process.env.BLOCKSCOUT_PRO_API_URL?.trim() || DEFAULT_PRO_API_URL

export interface BlockscoutApiTarget {
  /** Origin to build request URLs from; callers append their own path. */
  baseUrl: string
  /** Query params every request must carry (`chain_id`, `apikey`), empty on the public instance. */
  authParams: Record<string, string>
  /** True when requests go to the authenticated PRO API. */
  isPro: boolean
}

/**
 * @returns Where to send RPC-style Blockscout calls, and what to append to authenticate.
 *
 * @example
 * ```ts
 * const { baseUrl, authParams } = resolveBlockscoutApiTarget()
 * const url = new URL(`${baseUrl}/api`)
 * for (const [k, v] of Object.entries({ ...authParams, ...params })) url.searchParams.append(k, v)
 * ```
 */
export function resolveBlockscoutApiTarget(baseUrlOverride?: string): BlockscoutApiTarget {
  // An explicit override is a deliberate choice by the caller (tests, a pinned instance); honour it
  // verbatim rather than silently redirecting it at the PRO API.
  if (baseUrlOverride) {
    return { baseUrl: baseUrlOverride, authParams: {}, isPro: false }
  }

  if (!apiKey) {
    return { baseUrl: BLOCKSCOUT_URL, authParams: {}, isPro: false }
  }

  return {
    baseUrl: proApiUrl,
    // chain_id is required: one host serves every chain, so omitting it is not "default to ours".
    authParams: { chain_id: CHAIN_ID, apikey: apiKey },
    isPro: true,
  }
}

/** Whether the PRO API is configured. Exposed so callers can log/pace differently. */
export function isBlockscoutProApiEnabled(): boolean {
  return Boolean(apiKey)
}
