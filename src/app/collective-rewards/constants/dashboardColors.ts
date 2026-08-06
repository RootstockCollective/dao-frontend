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
 * Backer/Builder is a two-part ratio of one quantity, so it avoids the token palette — the
 * design used blue and orange, which would mean USDRIF and rBTC three lines above it in the
 * same card.
 *
 * Purple for Builders because it is the one brand hue no reward token claims, and because the
 * grey it replaces read as disabled, implying Builders were the lesser half. Two tints of a
 * single hue were tried first and abandoned: on a dark card the pair only reached 2.45:1
 * against each other, where white against this purple measures 3.23:1. Both segments clear
 * 4.9:1 against the card, and every bar is labelled with its percentages, so the split is
 * never carried by colour alone.
 */
export const SPLIT_COLORS = {
  backers: 'var(--color-v3-text-100)',
  builders: 'var(--brand-rootstock-purple)',
  /** Unfilled remainder of a bar that measures progress rather than a split. */
  track: 'var(--color-v3-bg-accent-60)',
} as const

/** Total backing series in the cycle chart. */
export const BACKING_SERIES_COLOR = 'var(--brand-rif-blue)'
