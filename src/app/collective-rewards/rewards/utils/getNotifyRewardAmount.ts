import {
  BackerRewardsClaimedEventLog,
  GaugeNotifyRewardEventLog,
  NotifyRewardEventLog,
} from '@/app/collective-rewards/rewards'
import { formatBalanceToHuman } from '@/app/user/Balances/balanceUtils'
import { RBTC, RIF } from '@/lib/constants'
import { tokenContracts } from '@/lib/contracts'
import { Address, getAddress, isAddressEqual } from 'viem'

interface BuilderClaimedRewards {
  [RIF]: number
  [RBTC]: number
}
export const getNotifyRewardAmount = (
  gauges: Address[],
  notifyRewardEvents: Record<Address, GaugeNotifyRewardEventLog>,
) => {
  const buildersClaimedRifLastCycle: Record<Address, BuilderClaimedRewards> = {}
  for (const gauge of gauges) {
    const gaugeClaimedEvents = notifyRewardEvents[gauge] ?? []
    // Calculate total amount of RIF claimed by the backer
    const gaugeRifClaimedTotal: bigint = gaugeClaimedEvents.reduce(
      (acc, value) =>
        isAddressEqual(value.args.rewardToken_, getAddress(tokenContracts.RIF))
          ? acc + value.args.builderAmount_
          : acc,
      0n,
    )
    // Calculate total amount of RBTC claimed by the backer
    const gaugeRbtcClaimedTotal: bigint = gaugeClaimedEvents.reduce(
      (acc, value) =>
        isAddressEqual(value.args.rewardToken_, getAddress(tokenContracts.RBTC))
          ? acc + value.args.builderAmount_
          : acc,
      0n,
    )
    buildersClaimedRifLastCycle[gauge] = {
      RIF: Number(formatBalanceToHuman(gaugeRifClaimedTotal)),
      RBTC: Number(formatBalanceToHuman(gaugeRbtcClaimedTotal)),
    }
  }
  return buildersClaimedRifLastCycle
}
