/**
 * Predefined support ticket topics shown in the support modal and validated
 * server-side. Single source of truth shared by the client form and the
 * `/api/support/ticket` route.
 */
export const SUPPORT_TOPICS = ['Connecting my wallet', 'Staking', 'Proposals', 'Rewards', 'Other'] as const

export type SupportTopic = (typeof SUPPORT_TOPICS)[number]

export const SUPPORT_REFERENCE_TYPES = ['Wallet address', 'Transaction hash'] as const

export type SupportReferenceType = (typeof SUPPORT_REFERENCE_TYPES)[number]

/** EVM address: `0x` + 40 hex chars. */
export const SUPPORT_ADDRESS_REGEX = /^0x[0-9a-fA-F]{40}$/
/** EVM transaction hash: `0x` + 64 hex chars. */
export const SUPPORT_TX_HASH_REGEX = /^0x[0-9a-fA-F]{64}$/

/** Longest accepted reference (a tx hash), used to cap the field client- and server-side. */
export const MAX_SUPPORT_REFERENCE_LENGTH = 66

export const SUPPORT_REFERENCE_LABELS: Record<SupportReferenceType, string> = {
  'Wallet address': 'Wallet address (0x...)',
  'Transaction hash': 'Transaction hash (0x...)',
}

export const SUPPORT_REFERENCE_ERRORS: Record<SupportReferenceType, string> = {
  'Wallet address': 'Enter a valid wallet address (0x followed by 40 hex characters)',
  'Transaction hash': 'Enter a valid transaction hash (0x followed by 64 hex characters)',
}

export const isValidSupportReference = (type: SupportReferenceType, value: string): boolean =>
  type === 'Transaction hash' ? SUPPORT_TX_HASH_REGEX.test(value) : SUPPORT_ADDRESS_REGEX.test(value)
