import { useEpochStateMock } from './useEpochState.mock'
import { useEpochStateContract } from './useEpochState.contract'

export const useEpochState =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract' ? useEpochStateContract : useEpochStateMock
