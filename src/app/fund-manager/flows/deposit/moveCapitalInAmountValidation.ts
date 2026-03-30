/**
 * Pure validation for `moveCapitalIn(assets)` against on-chain `reportedOffchainAssets`.
 * Mirrors the pattern of `reportedOffchainWarnings.ts` (NAV flow): logic lives in testable helpers, not the amount hook.
 */

/** When `reportedOffchainWei` is null/undefined (cap not loaded), returns false. */
export function isAmountOverReportedOffchain(
  amountWei: bigint,
  reportedOffchainWei: bigint | null | undefined,
): boolean {
  if (reportedOffchainWei == null) return false
  return amountWei > reportedOffchainWei
}

/**
 * Blocking error when the entered amount would revert with `OffchainAssetsInsufficient`.
 * Returns `null` when the amount is within the cap, or when `reportedOffchainWei` is not yet known
 * (e.g. vault reads still loading) so the comparison does not apply.
 */
export function moveCapitalInBlockingError(
  amountWei: bigint,
  reportedOffchainWei: bigint | null | undefined,
  reportedOffchainAmountDisplay: string,
): string | null {
  if (isAmountOverReportedOffchain(amountWei, reportedOffchainWei)) {
    return `Amount cannot exceed reported offchain assets (${reportedOffchainAmountDisplay}). Please reduce the amount.`
  }
  return null
}

/**
 * Spendable max for deposit UI (percentage / Max): min(wallet, reported off-chain).
 * When `reportedOffchainWei` is null (batch loading or batch read failed), only wallet balance is used.
 */
export function effectiveDepositMaxWei(walletBalanceWei: bigint, reportedOffchainWei: bigint | null): bigint {
  if (reportedOffchainWei == null) return walletBalanceWei
  return walletBalanceWei < reportedOffchainWei ? walletBalanceWei : reportedOffchainWei
}
