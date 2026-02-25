import { useSubmitDepositMock } from './useSubmitDeposit.mock'
import { useSubmitDepositContract } from './useSubmitDeposit.contract'

export const useSubmitDeposit =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useSubmitDepositContract
    : useSubmitDepositMock
