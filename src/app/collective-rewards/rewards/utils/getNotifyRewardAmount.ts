import { GaugeNotifyRewardEventLog, Token } from '@/app/collective-rewards/rewards'
import { Address, isAddressEqual } from 'viem'

export const getNotifyRewardAmount = (
  notifyRewardEvents: Record<Address, GaugeNotifyRewardEventLog>,
  token: Token,
  type: 'builderAmount_' | 'backersAmount_',
) => {
  return Object.keys(notifyRewardEvents).reduce<Record<Address, bigint>>((acc, key) => {
    const event = notifyRewardEvents[key as Address]
    acc[key as Address] = event.reduce(
      (acc, { args }) => (isAddressEqual(args.rewardToken_, token.address) ? acc + args[type] : acc),
      0n,
    )

    return acc
  }, {})
}
