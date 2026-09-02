/**
 * Corner radius shared by every surface on the dashboard — the metric tiles, the ABI hero, the
 * chart, the distribution panel and the history table.
 *
 * Kept as one constant rather than a literal per component because the value is the single
 * loudest thing about the design: at `rounded-lg` the page reads as a stack of boxes, and the
 * five surfaces have to move together or the row looks broken. Scoped to Collective Rewards
 * for now; promoting it to a theme token is a separate, app-wide decision.
 */
export const CARD_RADIUS = 'rounded-[28px]'
