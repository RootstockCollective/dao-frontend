import type { Address } from 'viem'

import { rbtcVault } from '@/lib/contracts'

/**
 * Readonly contract descriptors for the BTC vault multicall that backs {@link useActionEligibility}.
 * Kept in one module so wagmi `readContracts` invalidation keys stay aligned with the hook.
 *
 * @param address - Vault user address passed into `asyncDepositRequests`, `asyncRedeemRequests`, and `balanceOf`
 */
export function getBtcVaultActionEligibilityContracts(address: Address) {
  return [
    { ...rbtcVault, functionName: 'depositRequestsPaused' as const },
    { ...rbtcVault, functionName: 'redeemRequestsPaused' as const },
    { ...rbtcVault, functionName: 'asyncDepositRequests' as const, args: [address] },
    { ...rbtcVault, functionName: 'asyncRedeemRequests' as const, args: [address] },
    { ...rbtcVault, functionName: 'balanceOf' as const, args: [address] },
  ] as const
}
