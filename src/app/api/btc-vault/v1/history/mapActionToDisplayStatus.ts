import type { BtcVaultHistoryDisplayStatus } from './types'

export function mapActionToDisplayStatus(action: string): BtcVaultHistoryDisplayStatus | undefined {
  switch (action) {
    case 'DEPOSIT_REQUEST':
    case 'REDEEM_REQUEST':
      return 'pending'
    case 'DEPOSIT_CLAIMABLE':
      return 'open_to_claim'
    case 'REDEEM_CLAIMABLE':
      return 'claim_pending'
    case 'REDEEM_ACCEPTED':
      return 'approved'
    case 'DEPOSIT_CLAIMED':
    case 'REDEEM_CLAIMED':
      return 'successful'
    case 'DEPOSIT_CANCELLED':
    case 'REDEEM_CANCELLED':
      return 'cancelled'
    default:
      return undefined
  }
}
