'use client'

import { Header, Label } from '@/components/TypographyNew'

import {
  getFiatAmount,
  useBackerRewardsContext,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { Button } from '@/components/ButtonNew'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { ReactElement, useMemo } from 'react'
import { USD } from '@/lib/constants'

export const UnclaimedRewardsMetric = ({ currency = 'USD' }: { currency?: string }): ReactElement => {
  const { prices } = usePricesContext()
  const { data, error } = useBackerRewardsContext()
  const unclaimedRewardsPerToken = useMemo(
    () =>
      Object.values(TOKENS).map(token => {
        const { address, symbol } = token
        const { earned: tokenEarnings } = data && data[address] ? data[address] : { earned: 0n }
        const earnedRewards = Object.values(tokenEarnings).reduce((acc, earned) => acc + earned, 0n)
        const tokenPrice = prices[symbol]?.price ?? 0
        const fiatAmount = getFiatAmount(earnedRewards, tokenPrice).toNumber()

        return {
          token,
          amount: earnedRewards,
          fiatAmount,
        }
      }),
    [data, prices],
  )
  const rifEarnings = unclaimedRewardsPerToken.find(reward => reward.token.symbol === 'RIF')?.amount ?? 0n
  const rbtcEarnings = unclaimedRewardsPerToken.find(reward => reward.token.symbol === 'RBTC')?.amount ?? 0n

  const usdValue = unclaimedRewardsPerToken.reduce((acc, reward) => acc + reward.fiatAmount, 0)
  useHandleErrors({ error, title: 'Error loading rewards' })

  const { claimRewards, isClaimable } = useClaimBackerRewards()

  return (
    <div className="flex flex-col w-64 gap-4 items-start ">
      <div className="flex flex-col items-start gap-2 self-stretch">
        <Label variant="tag" className="text-v3-bg-accent-0">
          Unclaimed Rewards
        </Label>
        <div className="flex items-center gap-2">
          <Header variant="h1" className="overflow-hidden text-ellipsis" caps>
            {formatCurrency(usdValue, {
              currency,
              showCurrency: false,
              showCurrencySymbol: false,
            })}
          </Header>
          <RifRbtcTooltip rbtcValue={rbtcEarnings} rifValue={rifEarnings}>
            <DottedUnderlineLabel
              className="text-right decoration-[8%] pt-3"
              style={{
                textDecorationSkipInk: 'auto',
                textUnderlinePosition: 'from-font',
              }}
            >
              {USD}
            </DottedUnderlineLabel>
          </RifRbtcTooltip>
        </div>
      </div>
      <Button variant="secondary-outline" onClick={claimRewards} disabled={!isClaimable}>
        Claim Rewards
      </Button>
    </div>
  )
}
