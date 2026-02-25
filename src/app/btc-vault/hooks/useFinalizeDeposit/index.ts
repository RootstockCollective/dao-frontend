import { useFinalizeDepositMock } from './useFinalizeDeposit.mock'
import { useFinalizeDepositContract } from './useFinalizeDeposit.contract'

export const useFinalizeDeposit =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useFinalizeDepositContract
    : useFinalizeDepositMock
