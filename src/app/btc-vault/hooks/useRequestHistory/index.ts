import { useRequestHistoryMock } from './useRequestHistory.mock'
import { useRequestHistoryContract } from './useRequestHistory.contract'

export const useRequestHistory =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useRequestHistoryContract
    : useRequestHistoryMock
