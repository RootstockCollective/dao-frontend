import { RewardTokenKey } from '@/lib/tokens'

/**
 * One colour per reward token, shared by the distribution panel, the cycle table and any
 * legend that names a token. Keyed by token key rather than symbol so the mapping survives
 * testnet, where the symbols are prefixed (`tRIF`, `tRBTC`).
 */
export const REWARD_TOKEN_COLORS: Record<RewardTokenKey, string> = {
  rif: 'var(--brand-rootstock-green)',
  rbtc: 'var(--color-v3-primary)',
  usdrif: 'var(--brand-rif-blue)',
}

/**
 * Backer/Builder is a two-part ratio of a single quantity, not two categories, so it reads
 * as a light/muted pair instead of borrowing the token palette. The design used blue and
 * orange here, which would mean USDRIF and rBTC three lines above it in the same card.
 */
export const SPLIT_COLORS = {
  backers: 'var(--color-v3-text-100)',
  builders: 'var(--color-v3-bg-accent-20)',
} as const

/** Total backing series in the cycle chart. */
export const BACKING_SERIES_COLOR = 'var(--brand-rif-blue)'
