/** Block reasons returned by `toActionEligibility` and consumed by `BtcVaultActions`. */
export const DEPOSIT_PAUSED_REASON = 'Deposits are currently paused'
export const WITHDRAWAL_PAUSED_REASON = 'Withdrawals are currently paused'
export const ACTIVE_REQUEST_REASON = 'You already have an active request'

/** No fee at launch per contract spec */
export const BTC_VAULT_DEPOSIT_FEE = '0'

/** Disclaimer shown at the bottom of the deposit modal on both steps */
export const BTC_VAULT_DEPOSIT_DISCLAIMER =
  'Subject to approval by fund manager. Shares are minted at the NAV confirmed at deposit window close. Cancelable until deposit window close.'

/** Step progress values for the 2-step deposit flow (amount → review) */
export const DEPOSIT_STEP_PROGRESS = [50, 100] as const
