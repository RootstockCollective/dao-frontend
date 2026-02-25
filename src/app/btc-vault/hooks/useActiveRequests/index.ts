import { useActiveRequestsMock } from './useActiveRequests.mock'
import { useActiveRequestsContract } from './useActiveRequests.contract'

export const useActiveRequests =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useActiveRequestsContract
    : useActiveRequestsMock
