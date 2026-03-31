import { useMemo } from 'react'
import { type Address, zeroAddress } from 'viem'

import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

/**
 * Fund admin: revoke `WHITELISTED_USER_ROLE` on PermissionsManager for an account.
 * Mirrors `useDepositToVault` (memoized config + `useContractWrite` loading flags).
 * When `account` is null, `canSubmit` is false — do not call `onRequestTransaction`.
 */
export const useRevokeWhitelistedUserRole = (account: Address | null) => {
  const target = account ?? zeroAddress

  const config = useMemo(
    () => ({
      ...permissionsManager,
      functionName: 'revokeRole' as const,
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
