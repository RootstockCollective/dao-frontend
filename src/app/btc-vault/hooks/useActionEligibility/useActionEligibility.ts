import { useMemo } from 'react'
import { useReadContracts } from 'wagmi'

import { AVERAGE_BLOCKTIME } from '@/lib/constants'
import { rbtcVault } from '@/lib/contracts'

import type { EligibilityStatus, PauseState, VaultRequest } from '../../services/types'
import { toActionEligibility } from '../../services/ui/mappers'

/**
 * Reads on-chain pause state and active request data from the RbtcAsyncVault contract,
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

    // TODO(DAO-XXXX): wire to contract when eligibility check is available
    const eligibility: EligibilityStatus = { eligible: true, reason: '' }

    const activeRequests: VaultRequest[] = []

    if (data.length > 2) {
      const depositResult = data[2]?.result as readonly [bigint, bigint] | undefined
      const redeemResult = data[3]?.result as readonly [bigint, bigint] | undefined

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
