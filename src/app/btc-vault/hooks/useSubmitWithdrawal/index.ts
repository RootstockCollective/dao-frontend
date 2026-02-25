import { useSubmitWithdrawalMock } from './useSubmitWithdrawal.mock'
import { useSubmitWithdrawalContract } from './useSubmitWithdrawal.contract'

export const useSubmitWithdrawal =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useSubmitWithdrawalContract
    : useSubmitWithdrawalMock
