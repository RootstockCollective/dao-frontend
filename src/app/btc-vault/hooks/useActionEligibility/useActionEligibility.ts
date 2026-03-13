import { useMemo } from 'react'
import { keccak256, stringToBytes } from 'viem'
import { useReadContracts } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { permissionsManager, rbtcVault } from '@/lib/contracts'

import { NOT_WHITELISTED_REASON } from '../../services/constants'
import type { EligibilityStatus, PauseState, VaultRequest } from '../../services/types'
import { toActionEligibility } from '../../services/ui/mappers'

const WHITELISTED_USER_ROLE = keccak256(stringToBytes('WHITELISTED_USER_ROLE'))

/**
 * Reads on-chain pause state, whitelist eligibility, and active request data,
 * then derives action eligibility via `toActionEligibility`.
 *
 * Polls every `AVERAGE_BLOCKTIME` (one RSK block) to stay in sync with contract state.
 */
export function useActionEligibility(address: `0x${string}` | undefined) {
  const contracts = useMemo(() => {
    const base = [
      {
        ...rbtcVault,
        functionName: 'depositRequestsPaused',
      } as const,
      {
        ...rbtcVault,
        functionName: 'redeemRequestsPaused',
      } as const,
    ]

    if (address) {
      return [
        ...base,
        {
          ...permissionsManager,
          functionName: 'hasRoleOrAdmin',
          args: [WHITELISTED_USER_ROLE, address],
        } as const,
        {
          ...rbtcVault,
          functionName: 'depositReq',
          args: [address],
        } as const,
        {
          ...rbtcVault,
          functionName: 'redeemReq',
          args: [address],
        } as const,
      ]
    }

    return base
  }, [address])

  const { data, isLoading, error } = useReadContracts({
    contracts,
    query: {
      refetchInterval: AVERAGE_BLOCKTIME,
      enabled: !!address,
    },
  })

  const result = useMemo(() => {
    if (!data || !address) return undefined

    const depositsPaused = (data[0]?.result as boolean | undefined) ?? false
    const redeemsPaused = (data[1]?.result as boolean | undefined) ?? false

    const pause: PauseState = {
      deposits: depositsPaused ? 'paused' : 'active',
      withdrawals: redeemsPaused ? 'paused' : 'active',
    }

    const isWhitelisted = data.length > 2 ? ((data[2]?.result as boolean | undefined) ?? false) : true
    const eligibility: EligibilityStatus = isWhitelisted
      ? { eligible: true, reason: '' }
      : { eligible: false, reason: NOT_WHITELISTED_REASON }

    const activeRequests: VaultRequest[] = []

    if (data.length > 3) {
      const depositResult = data[3]?.result as readonly [bigint, bigint] | undefined
      const redeemResult = data[4]?.result as readonly [bigint, bigint] | undefined

      if (depositResult) {
        const [epochId, assets] = depositResult
        if (epochId > 0n || assets > 0n) {
          activeRequests.push({
            id: `deposit-${epochId}`,
            type: 'deposit',
            amount: assets,
            status: 'pending',
            epochId: epochId.toString(),
            batchRedeemId: null,
            timestamps: { created: Date.now() / 1000 },
            txHashes: {},
          })
        }
      }

      if (redeemResult) {
        const [epochId, shares] = redeemResult
        if (epochId > 0n || shares > 0n) {
          activeRequests.push({
            id: `redeem-${epochId}`,
            type: 'withdrawal',
            amount: shares,
            status: 'pending',
            epochId: null,
            batchRedeemId: epochId.toString(),
            timestamps: { created: Date.now() / 1000 },
            txHashes: {},
          })
        }
      }
    }
    return toActionEligibility(pause, eligibility, activeRequests)
  }, [data, address])

  return { data: result, isLoading, error }
}
