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

/**
 * Detects failures of the whole `eth_call` into Multicall3 `aggregate3` (simulation gas / RPC),
 * as opposed to per-call failures returned inside aggregate3 when `allowFailure` is true.
 */
export function isLikelyOuterMulticallRpcFailure(err: unknown): boolean {
  const fp = errorFingerprint(err)
  return (
    fp.includes('outofgas') ||
    fp.includes('out of gas') ||
    fp.includes('-32603') ||
    fp.includes('internal json-rpc error') ||
    fp.includes('evm error') ||
    fp.includes('caller gas limit') ||
    fp.includes('call gas') ||
    fp.includes('gas limit exceeded') ||
    fp.includes('exceeds block gas limit')
  )
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
  try {
    return (await client.multicall(args)) as readonly MulticallAllowFailureRow[]
  } catch (err) {
    if (!isLikelyOuterMulticallRpcFailure(err)) throw err
    if (args.batchSize === 1) throw err
    return (await client.multicall({ ...args, batchSize: 1 })) as readonly MulticallAllowFailureRow[]
  }
}
