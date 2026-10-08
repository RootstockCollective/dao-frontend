import { publicClient as appPublicClient } from '@/lib/viemPublicClient'

export type AppPublicClient = typeof appPublicClient

/** Row shape for viem `multicall` with default `allowFailure: true` (used after wrapper widens generics). */
export interface MulticallAllowFailureRow {
  status: 'success' | 'failure'
  result?: unknown
  error?: Error
}

function errorFingerprint(err: unknown): string {
  if (!(err instanceof Error)) return ''
  const ctor = err.constructor?.name ?? ''
  return `${ctor} ${err.name} ${err.message}`.toLowerCase()
}

/** RPC / gas-envelope signals shared by strict chunk detection and (with one extra) thrown multicall errors. */
const CHUNK_ENVELOPE_SUBSTRINGS = [
  'outofgas',
  'out of gas',
  '-32603',
  'internal json-rpc error',
  'caller gas limit',
  'call gas',
  'gas limit exceeded',
  'exceeds block gas limit',
] as const

function fingerprintMatchesChunkEnvelope(fp: string): boolean {
  return CHUNK_ENVELOPE_SUBSTRINGS.some(s => fp.includes(s))
}

/**
 * Detects failures of the whole `eth_call` into Multicall3 `aggregate3` (simulation gas / RPC),
 * as opposed to per-call failures returned inside aggregate3 when `allowFailure` is true.
 *
 * Includes a bare `evm error` substring so thrown RPC errors still match; that substring is omitted
 * when deciding whether an all-failure multicall *result* was a chunk envelope issue (quoter reverts
 * often surface as "EVM error: execution reverted").
 */
export function isLikelyOuterMulticallRpcFailure(err: unknown): boolean {
  const fp = errorFingerprint(err)
  return fingerprintMatchesChunkEnvelope(fp) || fp.includes('evm error')
}

/**
 * viem maps a rejected `aggregate3` `readContract` to one failure row per call in that chunk, with
 * the same underlying reason — it does not throw. Detect that so we still retry with smaller chunks.
 */
function allRowsFailedFromSameChunkRpc(results: readonly MulticallAllowFailureRow[]): boolean {
  if (results.length === 0) return false
  if (!results.every(r => r.status === 'failure')) return false
  const e0 = results[0].error
  if (!e0 || !fingerprintMatchesChunkEnvelope(errorFingerprint(e0))) return false
  const fp0 = errorFingerprint(e0)
  return results.every(r => r.error !== undefined && errorFingerprint(r.error) === fp0)
}

/**
 * Runs viem `multicall` over Quoter (or similar) calls. If the RPC rejects the batched
 * `aggregate3` `eth_call` (common on strict `eth_call` gas envelopes), retries with
 * `batchSize: 1` (viem measures batch in calldata bytes — one Quoter call per chunk).
 */
export async function multicallWithGasEnvelopeRetry(
  client: AppPublicClient,
  args: Parameters<AppPublicClient['multicall']>[0],
): Promise<readonly MulticallAllowFailureRow[]> {
  const run = (multicallArgs: Parameters<AppPublicClient['multicall']>[0]) =>
    client.multicall(multicallArgs) as Promise<readonly MulticallAllowFailureRow[]>

  try {
    const first = await run(args)
    if (args.batchSize !== 1 && allRowsFailedFromSameChunkRpc(first)) {
      return await run({ ...args, batchSize: 1 })
    }
    return first
  } catch (err) {
    if (!isLikelyOuterMulticallRpcFailure(err)) throw err
    if (args.batchSize === 1) throw err
    return await run({ ...args, batchSize: 1 })
  }
}
