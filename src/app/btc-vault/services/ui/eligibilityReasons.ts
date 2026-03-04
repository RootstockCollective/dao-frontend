/**
 * Canonical reason strings for vault eligibility.
 * Single source of truth for hooks, mappers, and banners.
 */
export const ELIGIBILITY_REASON_DISCONNECTED = 'Wallet disconnected — reconnect to continue'

export const ELIGIBILITY_REASON_NOT_AUTHORIZED =
  'This wallet is not authorized to interact with the BTC Vault. Contact your administrator.'

export const ELIGIBILITY_REASON_DEPOSITS_PAUSED = 'Deposits are currently paused.'

export const ELIGIBILITY_REASON_WITHDRAWALS_PAUSED = 'Withdrawals are currently paused.'

export const ELIGIBILITY_REASON_ELIGIBLE = ''

export const ELIGIBILITY_REASON_LOADING = 'Loading eligibility…'
