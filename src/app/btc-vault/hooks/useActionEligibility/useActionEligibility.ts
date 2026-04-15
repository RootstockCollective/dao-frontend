'use client'

import { useCallback, useMemo } from 'react'
import type { Address } from 'viem'
import { useReadContracts } from 'wagmi'

import { getBtcVaultActionEligibilityContracts } from '@/app/btc-vault/hooks/get-btc-vault-action-eligibility-contracts'
import { useWhitelistCheck } from '@/app/btc-vault/hooks/useWhitelistCheck'

import type { EligibilityStatus, PauseState, VaultRequest } from '../../services/types'
import { toActionEligibility } from '../../services/ui/mappers'

/**
 * Vault multicall result order (must match {@link getBtcVaultActionEligibilityContracts}):
 * 0–1 pause flags, 2–3 deposit/redeem requests, 4 balanceOf(user).
 */
type VaultMulticallData = [
  { status: 'success' | 'failure'; result?: boolean },
  { status: 'success' | 'failure'; result?: boolean },
  { status: 'success' | 'failure'; result?: readonly [bigint, bigint] },
  { status: 'success' | 'failure'; result?: readonly [bigint, bigint] },
  { status: 'success' | 'failure'; result?: bigint },
]

/**
 * Reads vault pause state, active deposit/redeem requests, and vault share balance via multicall,
 * and deposit whitelist status via {@link useWhitelistCheck}, then maps to action eligibility.
 *
 * Both deposit and withdrawal eligibility are gated by the whitelist (loading / not whitelisted),
 * then by pause state, eligibility, and active requests.
 *
 * @param address - User wallet address, or undefined to disable queries
 * @returns { data, isLoading, error, refetch } where data is action eligibility or undefined until vault multicall resolves
 */
export function useActionEligibility(address: string | undefined) {
  const { isWhitelisted, isLoading: whitelistLoading, refetch: refetchWhitelist } = useWhitelistCheck()
  const enabled = !!address

  const vaultContracts = useMemo(() => {
    if (!address) return
    return getBtcVaultActionEligibilityContracts(address as Address)
  }, [address])

  const {
    data: rawVaultData,
    isLoading: isLoadingVault,
    error: vaultError,
    refetch: refetchVault,
  } = useReadContracts({
    contracts: vaultContracts,
    query: { enabled },
  })

  // Wagmi returns ContractFunctionResult[]; we assert the known 5-slot vault shape for fail-closed handling.
  const vaultData = rawVaultData as VaultMulticallData | undefined

  const refetch = useCallback(() => {
    void refetchVault()
    void refetchWhitelist()
  }, [refetchVault, refetchWhitelist])

  const whitelistForMapper = whitelistLoading ? null : isWhitelisted

  const data = useMemo(() => {
    if (!address || !vaultData) return

    const depositPaused = vaultData[0]?.status === 'success' ? (vaultData[0].result ?? true) : true
    const redeemPaused = vaultData[1]?.status === 'success' ? (vaultData[1].result ?? true) : true
    const depositReq = vaultData[2]?.status === 'success' ? vaultData[2].result : undefined
    const redeemReq = vaultData[3]?.status === 'success' ? vaultData[3].result : undefined

    const pause: PauseState = {
      deposits: depositPaused ? 'paused' : 'active',
      withdrawals: redeemPaused ? 'paused' : 'active',
    }

    const eligibility: EligibilityStatus = { eligible: true, reason: '' }

    const activeRequests: VaultRequest[] = []
    if (depositReq && depositReq[1] > 0n) {
      activeRequests.push({
        id: 'active-deposit',
        type: 'deposit',
        amount: depositReq[1],
        status: 'pending',
        epochId: String(depositReq[0]),
        batchRedeemId: null,
        timestamps: { created: 0 },
        txHashes: {},
      })
    }
    if (redeemReq && redeemReq[1] > 0n) {
      activeRequests.push({
        id: 'active-redeem',
        type: 'withdrawal',
        amount: redeemReq[1],
        status: 'pending',
        epochId: null,
        batchRedeemId: String(redeemReq[0]),
        timestamps: { created: 0 },
        txHashes: {},
      })
    }

    const balanceSlot = vaultData[4]
    const vaultTokenBalance =
      balanceSlot?.status === 'success' && typeof balanceSlot.result === 'bigint' ? balanceSlot.result : 0n
    const hasVaultShares = vaultTokenBalance > 0n

    return toActionEligibility(pause, eligibility, activeRequests, hasVaultShares, whitelistForMapper)
  }, [address, vaultData, whitelistForMapper])

  const isLoading = enabled && isLoadingVault

  return {
    data,
    isLoading,
    error: vaultError ?? undefined,
    refetch,
  }
}
