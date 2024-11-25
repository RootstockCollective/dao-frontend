import { BackersManagerAbi } from '@/lib/abis/v2/BackersManagerAbi'
import { BACKERS_MANAGER_ADDRESS } from '@/lib/constants'
import { useAccount, useReadContract } from 'wagmi'
import { parseEther } from 'viem'

/**
 * Custom hook to determine if an account can unstake a specified amount of RIF tokens
 *
 * @param amount - The amount to unstake in bigint format
 * @param stRifBalance - The current stRIF balance as a string
 * @returns An object containing:
 *  - canAccountWithdraw: boolean indicating if the account can withdraw the specified amount
 *  - isCanAccountWithdrawLoading: boolean indicating if the data is still loading
 *
 * @remarks
 * The hook calculates if an account can unstake by:
 * 1. Fetching the backer's total allocation from the BackersManager contract
 * 2. Converting input amount and balance to proper format using parseEther
 * 3. Calculating available balance by subtracting total allocation from current balance
 * 4. Comparing requested unstake amount against available balance
 *
 * @example
 * ```tsx
 * const { canAccountWithdraw, isCanAccountWithdrawLoading } = useCanAccountUnstakeAmount(
 *   "100", // amount to unstake
 *   "1000" // current stRIF balance
 * );
 * ```
 */
export const useCanAccountUnstakeAmount = (amount: string, stRifBalance: string) => {
  const { address } = useAccount()
  const { data: backerTotalAllocation, isLoading: isBackerTotalAllocationLoading } = useReadContract(
    address && {
      abi: BackersManagerAbi,
      address: BACKERS_MANAGER_ADDRESS,
      functionName: 'backerTotalAllocation',
      args: [address],
      query: {
        refetchInterval: 10000,
      },
    },
  )

  const parsedAmount = parseEther(amount) ?? 0n
  const parsedBalance = parseEther(stRifBalance) ?? 0n
  const balanceThatCanBeWithdraw = parsedBalance - (backerTotalAllocation || 0n)

  return {
    canAccountWithdraw: parsedAmount <= balanceThatCanBeWithdraw,
    isCanAccountWithdrawLoading: isBackerTotalAllocationLoading,
    backerTotalAllocation,
  }
}

/**
 * Example 1
 * If you have 300 tokens in your balance and have allocated 250 tokens to backing, your balanceThatCanBeWithdraw would be 50 tokens (300 - 250 = 50).
 * This means you can only unstake up to 50 tokens, as the remaining 250 are locked in allocations.
 * Example 2
 * Let's say you want to unstake 40 tokens:
 *
 * Your parsedBalance = 300
 * Your backerTotalAllocation = 250
 * Your balanceThatCanBeWithdraw = 50
 * Since 40 < 50, the unstaking will succeed.
 *
 * Example 3
 * However, if you try to unstake 60 tokens:
 *
 * Your parsedBalance = 300
 * Your backerTotalAllocation = 250
 * Your balanceThatCanBeWithdraw = 50
 * Since 60 > 50, the unstaking will fail because you're trying to unstake more tokens than are available.
 */
