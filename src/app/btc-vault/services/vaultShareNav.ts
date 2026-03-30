import { VAULT_SHARE_MULTIPLIER, WeiPerEther } from '@/lib/constants'

/**
 * One human vault share in on-chain raw units (same as `convertToAssets` 1-share input):
 * 18-decimal “share” × `VAULT_SHARE_MULTIPLIER` (1e6) = 24-decimal raw.
 */
export const RAW_VAULT_SHARE_UNITS_PER_HUMAN_SHARE = WeiPerEther * VAULT_SHARE_MULTIPLIER

/**
 * Fixed-point NAV at epoch close from `epochSnapshot` (`assetsAtClose`, `supplyAtClose`), using the same
 * `+1` rounding as on-chain. This is `ClaimableInfo.lockedSharePrice`: wei of rBTC per one **raw** share wei.
 *
 * @returns `0n` when `supplyAtCloseRaw + 1n` is not positive (denominator ≤ 0), e.g. invalid negative
 *   `supplyAtCloseRaw` such as `-1n`. `supplyAtCloseRaw === 0n` is valid (denominator `1n`, same as on-chain).
 */
export function lockedSharePriceFromEpochSnapshot(
  assetsAtCloseWei: bigint,
  supplyAtCloseRaw: bigint,
): bigint {
  return supplyAtCloseRaw + 1n > 0n ? ((assetsAtCloseWei + 1n) * WeiPerEther) / (supplyAtCloseRaw + 1n) : 0n
}

/**
 * Converts fixed-point NAV from **raw** share basis to rBTC wei per **one 1.0 human** vault share.
 *
 * Applies to:
 * - `ClaimableInfo.lockedSharePrice`: `((assetsAtClose+1) * 1e18) / (supplyAtClose+1)`
 * - `VaultMetrics.pricePerShare` (live): `(totalAssets * 1e18) / totalSupply`
 *
 * Both encode wei of rBTC per one raw share basis (24-decimal supply), not per human share.
 * Use this when surfacing “rBTC per 1.0 share” (human share) so the UI is not off by
 * `VAULT_SHARE_MULTIPLIER` (1e6).
 *
 * @returns rBTC wei per one human share (suitable for `formatSymbol` / fiat on “price per share”).
 */
export function lockedSharePriceToNavPerHumanShareWei(lockedSharePrice: bigint): bigint {
  return (RAW_VAULT_SHARE_UNITS_PER_HUMAN_SHARE * lockedSharePrice) / WeiPerEther
}
