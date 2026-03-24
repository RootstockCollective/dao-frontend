/** Block reasons returned by `toActionEligibility` and consumed by `BtcVaultActions`. */
export const DEPOSIT_PAUSED_REASON = 'Deposits are currently paused'
export const WITHDRAWAL_PAUSED_REASON = 'Withdrawals are currently paused'
export const ACTIVE_REQUEST_REASON = 'You already have an active request'
/** Shown when deposit or withdraw is blocked because the address lacks the whitelisted role (DAO-2109). */
export const NOT_WHITELISTED_REASON = 'Address not whitelisted.'
/** Shown when deposit is blocked because the address is not on the BTC vault deposit whitelist (DAO-2075). */
export const DEPOSIT_WHITELIST_BLOCK_REASON = 'Your address is not whitelisted for deposits'
/** Shown while the deposit whitelist check is still in flight (DAO-2075). */
export const DEPOSIT_ELIGIBILITY_LOADING_REASON = 'Checking deposit eligibility...'
/** Shown when withdraw is blocked because the user has no vault share balance (DAO-2109). */
export const NO_VAULT_SHARES_REASON = 'No vault shares to withdraw'
/** Shown when actions are disabled while a deposit/withdraw transaction is still pending (DAO-2109). */
export const REQUEST_SUBMITTING_REASON = 'Transaction in progress'

/** No fee at launch per contract spec */
export const BTC_VAULT_DEPOSIT_FEE = '0'

/** Disclaimer shown at the bottom of the deposit modal on both steps */
export const BTC_VAULT_DEPOSIT_DISCLAIMER =
  'Subject to approval by fund manager. Shares are minted at the NAV confirmed at deposit window close. Cancelable until deposit window close.'

/** Step progress values for the 2-step deposit flow (amount → review) */
export const DEPOSIT_STEP_PROGRESS = [50, 100] as const

/** No fee at launch per contract spec */
export const BTC_VAULT_WITHDRAWAL_FEE = '0'

/** Disclaimer shown at the bottom of the withdrawal modal on both steps */
export const BTC_VAULT_WITHDRAWAL_DISCLAIMER =
  'Subject to approval by fund manager. Shares are minted at the NAV confirmed at deposit window close. Cancelable until deposit window close.'

/** Step progress values for the 2-step withdrawal flow (amount → review) */
export const WITHDRAWAL_STEP_PROGRESS = [50, 100] as const

/** Qualitative expected completion time for withdrawal requests */
export const WITHDRAWAL_EXPECTED_COMPLETION = '5 days'

/** Qualitative expected completion time for deposit requests */
export const DEPOSIT_EXPECTED_COMPLETION = '5 days'

/**
 * Duration of one epoch in seconds (deposit/withdrawal window).
 * Used to derive endTime from startTime when startTime is known.
 * TODO(DAO-2066): align with product/config when final; countdown UI may show fallback when endTime is 0.
 */
export const EPOCH_DURATION_SEC = 6 * 24 * 3600 // 6 days
