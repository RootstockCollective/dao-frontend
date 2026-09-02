/**
 * Backer/Builder split, matching the design: RIF blue for Backers, primary orange for Builders.
 *
 * This pairing was avoided at first because the distribution panel used coloured dots to stand
 * for USDRIF and rBTC, so the same two hues a few lines above the split bar would each have
 * meant two different things. Those dots are now the tokens' own logos, which frees blue and
 * orange to mean only Backers and Builders. Reintroducing a colour-coded token legend anywhere
 * near a split bar would bring the clash back.
 */
export const SPLIT_COLORS = {
  backers: 'var(--brand-rif-blue)',
  builders: 'var(--color-v3-primary)',
  /** Unfilled remainder of a bar that measures progress rather than a split. */
  track: 'var(--color-v3-bg-accent-60)',
} as const

/** Total backing series in the cycle chart. */
export const BACKING_SERIES_COLOR = 'var(--brand-rif-blue)'
