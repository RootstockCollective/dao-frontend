import { rootstock, rootstockTestnet } from 'viem/chains'

export function requireBlockscoutUrl(): string {
  const base = (process.env.NEXT_PUBLIC_BLOCKSCOUT_URL ?? '').trim()
  if (!base) {
    throw new Error('NEXT_PUBLIC_BLOCKSCOUT_URL is not configured; cannot fall back for BTC vault history')
  }
  return base.replace(/\/$/, '')
}

export function requireNodeUrl(): string {
  const url = (process.env.NEXT_PUBLIC_NODE_URL ?? '').trim()
  if (!url) {
    throw new Error('NEXT_PUBLIC_NODE_URL is not configured; cannot enrich BTC vault history from RPC')
  }
  return url
}

export function normalizeAddress(value: string | undefined): string {
  if (!value) return ''
  const v = value.toLowerCase()
  return v.startsWith('0x') ? v : `0x${v}`
}

/** Normalizes GET `type` values (`deposit_request`, `DEPOSIT_REQUEST`, `deposit-request`) to subgraph action strings. */
export function normalizeHistoryActionType(raw: string): string {
  return raw.trim().toUpperCase().replaceAll('-', '_')
}

export function getRootstockLikeChain() {
  const id = Number(process.env.NEXT_PUBLIC_CHAIN_ID ?? 31)
  const base = id === 30 ? rootstock : rootstockTestnet
  const rpcUrl = requireNodeUrl()
  return {
    ...base,
    rpcUrls: {
      ...base.rpcUrls,
      default: { http: [rpcUrl] },
    },
  }
}
