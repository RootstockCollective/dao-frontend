import { useMemo } from 'react'
import type { Address } from 'viem'

import { WHITELISTED_USER_ROLE } from '@/lib/constants'
import { permissionsManager } from '@/lib/contracts'
import { useContractWrite } from '@/shared/hooks/useContractWrite'

const PLACEHOLDER_ACCOUNT = '0x0000000000000000000000000000000000000000' as Address

/**
 * Fund admin: revoke `WHITELISTED_USER_ROLE` on PermissionsManager for an account.
 * Mirrors `useDepositToVault` (memoized config + `useContractWrite` loading flags).
 * When `account` is null, `canSubmit` is false — do not call `onRequestTransaction`.
 */
export const useRevokeWhitelistedUserRole = (account: Address | null) => {
  const target = account ?? PLACEHOLDER_ACCOUNT

  const config = useMemo(
    () => ({
      ...permissionsManager,
      functionName: 'revokeRole' as const,
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
