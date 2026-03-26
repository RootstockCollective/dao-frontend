import { useMemo } from 'react'
import { type Address, zeroAddress } from 'viem'

import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Fund admin: grant `WHITELISTED_USER_ROLE` on PermissionsManager for an account.
 * Same pattern as `useRevokeWhitelistedUserRole` / `useDepositToVault`.
 * When `account` is null, `canSubmit` is false — do not call `onRequestTransaction`.
 */
export const useGrantWhitelistedUserRole = (account: Address | null) => {
  const target = account ?? zeroAddress

  const config = useMemo(
    () => ({
      ...permissionsManager,
      functionName: 'grantRole' as const,
      args: [WHITELISTED_USER_ROLE, target] as const,
    }),
    [target],
  )

  const result = useContractWrite(config)

  return {
    ...result,
    canSubmit: account !== null,
  }
}
