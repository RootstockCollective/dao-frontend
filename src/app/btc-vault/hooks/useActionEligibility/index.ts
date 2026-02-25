import { useActionEligibilityMock } from './useActionEligibility.mock'
import { useActionEligibilityContract } from './useActionEligibility.contract'

export const useActionEligibility =
  process.env.NEXT_PUBLIC_BTC_VAULT_DATA_SOURCE === 'contract'
    ? useActionEligibilityContract
    : useActionEligibilityMock
