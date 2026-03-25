import { useMemo } from 'react'
import type { Address } from 'viem'

import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

const PLACEHOLDER_ACCOUNT = '0x0000000000000000000000000000000000000000' as Address

/**
 * Fund admin: grant `WHITELISTED_USER_ROLE` on PermissionsManager for an account.
 * Same pattern as `useRevokeWhitelistedUserRole` / `useDepositToVault`.
 * When `account` is null, `canSubmit` is false — do not call `onRequestTransaction`.
 */
export const useGrantWhitelistedUserRole = (account: Address | null) => {
  const target = account ?? PLACEHOLDER_ACCOUNT

  const config = useMemo(
    () => ({
      ...permissionsManager,
      functionName: 'grantRole' as const,
      args: [WHITELISTED_USER_ROLE as `0x${string}`, target] as const,
    }),
    [target],
  )

  const result = useContractWrite(config)

  return {
    ...result,
    canSubmit: account !== null,
  }
}
