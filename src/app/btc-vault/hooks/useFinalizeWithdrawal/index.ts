import { useFinalizeWithdrawalMock } from './useFinalizeWithdrawal.mock'
import { useFinalizeWithdrawalContract } from './useFinalizeWithdrawal.contract'

export const useFinalizeWithdrawal =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useFinalizeWithdrawalContract
    : useFinalizeWithdrawalMock
