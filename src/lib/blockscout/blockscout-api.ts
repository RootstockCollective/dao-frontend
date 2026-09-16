/**
 * Single place that decides which Blockscout API answers our calls, and how to authenticate.
 *
 * ## Why this exists
 *
 * Blockscout deprecated the per-instance API ("PER INSTANCE API WILL BE DEPRECATED JULY 1").
 * Public explorer instances are now bot-protected: measured against `rootstock.blockscout.com`,
 * an unauthenticated caller gets **10 requests per ~16-minute window per IP**, then hard 429s until
 * it resets. That is ~0.01 req/s — far below what any of our routes need, and why the gauge routes
 * answered 504.
 *
 * The replacement is the multichain PRO API on `api.blockscout.com`, which serves the same data
 * behind a real quota (5 rps on the free tier).
 *
 * ## The two shapes are not symmetric
 *
 * This is the trap worth knowing: `chain_id` moves depending on which API you call.
 *
 * | Style   | Per-instance (old)              | PRO (new)                                           |
 * | ------- | ------------------------------- | --------------------------------------------------- |
 * | RPC     | `{host}/api?module=…`           | `api.blockscout.com/v2/api?chain_id=30&apikey=…`     |
 * | REST v2 | `{host}/api/v2/{path}`          | `api.blockscout.com/30/api/v2/{path}?apikey=…`       |
 *
 * RPC takes `chain_id` as a **query param**; REST takes it as a **path segment**.
 *
 * @remarks
 * - **Opt-in.** With no key configured every call keeps going to the public instance, so
 *   environments without one behave exactly as before rather than failing closed.
 * - **`BLOCKSCOUT_API_KEY` may hold several keys**, comma-separated. Requests round-robin across
 *   them; see `blockscout-key-pool.ts` for what that does and does not buy.
 * - **Server-only.** {@link process.env.BLOCKSCOUT_API_KEY} is deliberately not `NEXT_PUBLIC_` —
 *   that would ship the key to every browser. Import this from server code only; browser callers
 *   must go through one of our own API routes instead.
 * - `NEXT_PUBLIC_BLOCKSCOUT_URL` stays the **explorer origin for UI links** (see
 *   `src/config/config.ts`) and the fallback API host. Do not repoint it at the PRO API.
 */
import { CHAIN_ID } from '@/lib/constants'

import { getBlockscoutKeyCount, nextBlockscoutApiKey } from './blockscout-key-pool'

/** Multichain PRO API host root. Both the RPC and REST bases are derived from it. */
const DEFAULT_PRO_API_HOST = 'https://api.blockscout.com'

/**
 * Every setting is read per call rather than captured at import time.
 *
 * Module-scope capture binds whatever the environment held when the first importer loaded, which
 * silently ignores later changes — including the ones tests make in `beforeEach`, leaving them to
 * hit the network for real.
 */
/**
 * Takes the next key in rotation. See {@link nextBlockscoutApiKey} — `BLOCKSCOUT_API_KEY` holds one
 * key or a comma-separated list, and consecutive calls walk the list so no single key absorbs the
 * whole load.
 */
const apiKey = (): string | undefined => nextBlockscoutApiKey()

const proApiHost = (): string =>
  stripTrailingSlash(process.env.BLOCKSCOUT_PRO_API_HOST?.trim() || DEFAULT_PRO_API_HOST)

/**
 * The public instance is the fallback host, so its absence is only fatal when there is no key to
 * fall back *from*. Failing here beats building `undefined/api` and reporting a confusing 404.
 */
function requirePublicInstanceUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL ?? '').trim()
  if (!base) {
    throw new Error(
      'Blockscout is not configured: set BLOCKSCOUT_API_KEY to use the PRO API, or NEXT_PUBLIC_BLOCKSCOUT_URL to fall back to a public instance',
    )
  }
  return stripTrailingSlash(base)
}

const stripTrailingSlash = (value: string): string => value.replace(/\/$/, '')
const stripLeadingSlash = (value: string): string => value.replace(/^\//, '')

export interface BlockscoutRpcTarget {
  /** Origin to build request URLs from; callers append `/api` themselves. */
  baseUrl: string
  /** Query params every request must carry (`chain_id`, `apikey`); empty on the public instance. */
  authParams: Record<string, string>
  /** True when requests go to the authenticated PRO API. */
  isPro: boolean
}

/**
 * Resolves the target for RPC-style calls (`?module=…&action=…`).
 *
 * @param baseUrlOverride — Pins a specific explorer. Honoured verbatim and **never** authenticated,
 *   so a deliberately pinned instance can never receive our key.
 *
 * @example
 * ```ts
 * const { baseUrl, authParams } = resolveBlockscoutRpcTarget()
 * const url = new URL(`${baseUrl}/api`)
 * for (const [k, v] of Object.entries({ ...authParams, ...params })) url.searchParams.append(k, v)
 * ```
 */
export function resolveBlockscoutRpcTarget(baseUrlOverride?: string): BlockscoutRpcTarget {
  if (baseUrlOverride) {
    return { baseUrl: stripTrailingSlash(baseUrlOverride), authParams: {}, isPro: false }
  }

  const key = apiKey()
  if (!key) {
    return { baseUrl: requirePublicInstanceUrl(), authParams: {}, isPro: false }
  }

  return {
    // RPC lives under /v2 and selects the chain with a query param.
    baseUrl: `${proApiHost()}/v2`,
    authParams: { chain_id: CHAIN_ID, apikey: key },
    isPro: true,
  }
}

/**
 * Builds a full REST v2 URL, authenticated when a key is configured.
 *
 * @param path — Endpoint below `api/v2`, with or without a leading slash
 *   (e.g. `addresses/0x…`, `tokens/0x…/holders`).
 * @param searchParams — Extra query params to append.
 * @returns An absolute URL string ready for `fetch`.
 *
 * @example
 * ```ts
 * // PRO:    https://api.blockscout.com/30/api/v2/addresses/0xabc?apikey=proapi_xxx
 * // Public: https://rootstock.blockscout.com/api/v2/addresses/0xabc
 * buildBlockscoutRestUrl(`addresses/${address}`)
 * ```
 */
export function buildBlockscoutRestUrl(path: string, searchParams: Record<string, string> = {}): string {
  const cleanPath = stripLeadingSlash(path)

  // REST puts the chain in the path, unlike RPC — see the table above.
  const key = apiKey()
  const url = key
    ? new URL(`${proApiHost()}/${CHAIN_ID}/api/v2/${cleanPath}`)
    : new URL(`${requirePublicInstanceUrl()}/api/v2/${cleanPath}`)

  if (key) {
    url.searchParams.set('apikey', key)
  }
  for (const [key, value] of Object.entries(searchParams)) {
    url.searchParams.set(key, value)
  }

  return url.toString()
}

/** Whether the PRO API is configured. Exposed so callers can log or pace differently. */
export function isBlockscoutProApiEnabled(): boolean {
  // Asks the pool's size rather than taking a key, so a status check does not advance rotation.
  return getBlockscoutKeyCount() > 0
}
