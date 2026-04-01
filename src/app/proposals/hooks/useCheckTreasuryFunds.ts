import { useReadContract, useReadContracts, useBalance } from 'wagmi'
import { useMemo } from 'react'
import { Address } from 'viem'
import { GovernorAbi } from '@/lib/abis/Governor'
import { GovernorAddress, tokenContracts } from '@/lib/contracts'
import { RIFTokenAbi } from '@/lib/abis/RIFTokenAbi'
import { isTreasuryContract, decodeTreasuryTransfer } from '../utils/treasuryFundsCheck'
import type { TreasuryTransferInfo } from '@/app/proposals/shared/treasuryUtils'
import { RIF, USDRIF } from '@/lib/constants'

export interface TreasuryFundsCheckResult {
  hasEnoughFunds: boolean
  isLoading: boolean
  missingAsset?: string
}

/**
 * Hook to check if the treasury has enough funds to execute a proposal
 * Returns whether funds are sufficient and which asset is missing if not
 */
export const useCheckTreasuryFunds = (proposalId: string): TreasuryFundsCheckResult => {
  // Read proposal details from Governor contract
  const { data: proposalDetails, isLoading: isLoadingProposal } = useReadContract({
    abi: GovernorAbi,
    address: GovernorAddress,
    functionName: 'proposalDetails',
    args: [BigInt(proposalId)],
    query: {
      enabled: !!proposalId,
    },
  })

  const [targets, , calldatas] = proposalDetails || [[], [], []]

  // Find treasury interactions
  const treasuryInteractions = useMemo(() => {
    if (!targets || !calldatas) return []

    const interactions: Array<{ target: Address; transferInfo: TreasuryTransferInfo }> = []

    for (let i = 0; i < targets.length; i++) {
      const target = targets[i] as Address
      const calldata = calldatas[i] as string

      if (isTreasuryContract(target) && calldata) {
        const transferInfo = decodeTreasuryTransfer(calldata)
        if (transferInfo) {
          interactions.push({ target, transferInfo })
        }
      }
    }

    return interactions
  }, [targets, calldatas])

  // Get balances for all treasury contracts that are targets
  const treasuryTargets = useMemo(() => {
    if (!targets) return []
    return Array.from(new Set(targets.filter(isTreasuryContract) as Address[]))
  }, [targets])

  // Get the first treasury target for rBTC balance (most proposals have one treasury target)
  const firstTreasuryTarget = treasuryTargets[0]

  // Get rBTC balance for the first treasury target
  const { data: rbtcBalance, isLoading: isLoadingRBTC } = useBalance({
    address: firstTreasuryTarget,
    query: {
      enabled: !!firstTreasuryTarget,
    },
  })

  // Get ERC20 token balances for all treasury targets
  const erc20BalanceContracts = treasuryTargets.flatMap(target => [
    {
      abi: RIFTokenAbi,
      address: tokenContracts[RIF],
      functionName: 'balanceOf' as const,
      args: [target] as [Address],
    },
    {
      abi: RIFTokenAbi,
      address: tokenContracts[USDRIF],
      functionName: 'balanceOf' as const,
      args: [target] as [Address],
    },
  ])

  const { data: erc20Balances, isLoading: isLoadingERC20 } = useReadContracts({
    contracts: erc20BalanceContracts,
    query: {
      enabled: erc20BalanceContracts.length > 0,
    },
  })

  // Check if we have enough funds
  const result = useMemo((): TreasuryFundsCheckResult => {
    if (isLoadingProposal || isLoadingERC20 || isLoadingRBTC) {
      return { hasEnoughFunds: true, isLoading: true }
    }

    if (treasuryInteractions.length === 0) {
      // No treasury interactions, funds check passes
      return { hasEnoughFunds: true, isLoading: false }
    }

    // Build a map of treasury target -> token -> balance
    const balancesMap = new Map<Address, Map<string | null, bigint>>()

    // Populate rBTC balance for the first treasury target
    if (firstTreasuryTarget && rbtcBalance) {
      if (!balancesMap.has(firstTreasuryTarget)) {
        balancesMap.set(firstTreasuryTarget, new Map())
      }
      const tokenMap = balancesMap.get(firstTreasuryTarget)!
      tokenMap.set(null, rbtcBalance.value || 0n) // null represents rBTC
    }

    // Populate ERC20 balances
    if (erc20Balances) {
      treasuryTargets.forEach((target, targetIndex) => {
        if (!balancesMap.has(target)) {
          balancesMap.set(target, new Map())
        }
        const tokenMap = balancesMap.get(target)!

        // RIF balance is at index targetIndex * 2
        const rifBalanceIndex = targetIndex * 2
        const usdrifBalanceIndex = targetIndex * 2 + 1

        if (erc20Balances[rifBalanceIndex]?.result) {
          tokenMap.set(tokenContracts[RIF].toLowerCase(), erc20Balances[rifBalanceIndex].result as bigint)
        }
        if (erc20Balances[usdrifBalanceIndex]?.result) {
          tokenMap.set(
            tokenContracts[USDRIF].toLowerCase(),
            erc20Balances[usdrifBalanceIndex].result as bigint,
          )
        }
      })
    }

    // Check each treasury interaction
    for (const { target, transferInfo } of treasuryInteractions) {
      const tokenMap = balancesMap.get(target)
      if (!tokenMap) {
        // Can't find balance for this target, assume insufficient
        return {
          hasEnoughFunds: false,
          missingAsset: transferInfo.tokenSymbol,
          isLoading: false,
        }
      }

      // Get the balance key
      const balanceKey = transferInfo.tokenAddress ? transferInfo.tokenAddress.toLowerCase() : null // null for rBTC

      const balance = tokenMap.get(balanceKey) || 0n

      if (balance < transferInfo.amount) {
        return {
          hasEnoughFunds: false,
          missingAsset: transferInfo.tokenSymbol,
          isLoading: false,
        }
      }
    }

    return { hasEnoughFunds: true, isLoading: false }
  }, [
    isLoadingProposal,
    isLoadingERC20,
    isLoadingRBTC,
    rbtcBalance,
    treasuryInteractions,
    treasuryTargets,
    erc20Balances,
    firstTreasuryTarget,
  ])

  return result
}
