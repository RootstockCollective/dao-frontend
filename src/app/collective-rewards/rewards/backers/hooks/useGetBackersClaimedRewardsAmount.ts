import { BackerRewardsClaimedEventLog } from '@/app/collective-rewards/rewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { RBTC, RIF } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { useMemo } from 'react'
import { Address, getAddress, isAddressEqual } from 'viem'

interface BuilderClaimedRewards {
  [RIF]: number
  [RBTC]: number
}
export const useGetBackersClaimedRewardsAmount = (
  gauges: Address[],
  backersClaimedEvents: Record<Address, BackerRewardsClaimedEventLog>,
) => {
  const buildersClaimedRifLastCycle = useMemo(() => {
    const buildersClaimed: Record<Address, BuilderClaimedRewards> = {}
    for (const gauge of gauges) {
      const gaugeClaimedEvents = backersClaimedEvents[gauge] ?? []
      // Calculate total amount of RIF claimed by the backer
      const gaugeRifClaimedTotal: bigint = gaugeClaimedEvents.reduce(
        (acc, value) =>
          isAddressEqual(value.args.rewardToken_, getAddress(tokenContracts.RIF))
            ? acc + value.args.amount_
            : acc,
        0n,
      )
      // Calculate total amount of RBTC claimed by the backer
      const gaugeRbtcClaimedTotal: bigint = gaugeClaimedEvents.reduce(
        (acc, value) =>
          isAddressEqual(value.args.rewardToken_, getAddress(tokenContracts.RBTC))
            ? acc + value.args.amount_
            : acc,
        0n,
      )
      buildersClaimed[gauge] = {
        RIF: Number(formatBalanceToHuman(gaugeRifClaimedTotal)),
        RBTC: Number(formatBalanceToHuman(gaugeRbtcClaimedTotal)),
      }
    }
    return buildersClaimed
  }, [backersClaimedEvents, gauges])
  return buildersClaimedRifLastCycle
}
