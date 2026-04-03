import type { Address } from 'viem'

export const DEFAULT_VISIBLE_WALLETS = 5

/** Custodial wallet shown in Capital Allocation transparency (Rootstock testnet). */
export const TRANSPARENCY_WALLET_ADDRESS =
  '0x8ea0e8c0552a3434a6055aebdf49750cd71889de' as const satisfies Address

export const TRANSPARENCY_WALLET_LABEL = 'Foredefi 1'

export const TRANSPARENCY_WALLET_LABEL_URL = `https://rootstock.blockscout.com/address/${TRANSPARENCY_WALLET_ADDRESS}?tab=coin_balance_history`

export const TRANSPARENCY_STRATEGY_LABEL = 'Simulated strategy 1'

export const TRANSPARENCY_STRATEGY_URL = `https://debank.com/profile/${TRANSPARENCY_WALLET_ADDRESS}`
