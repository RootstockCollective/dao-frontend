import { useUserPositionMock } from './useUserPosition.mock'
import { useUserPositionContract } from './useUserPosition.contract'

export const useUserPosition =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract' ? useUserPositionContract : useUserPositionMock
