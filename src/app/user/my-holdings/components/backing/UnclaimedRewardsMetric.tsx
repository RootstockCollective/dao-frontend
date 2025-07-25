'use client'

import { Span } from '@/components/TypographyNew'

import {
  getFiatAmount,
  useBackerRewardsContext,
  useClaimBackerRewards,
} from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components'
import { Button } from '@/components/ButtonNew'
import { DottedUnderlineLabel } from '@/components/DottedUnderlineLabel/DottedUnderlineLabel'
import { RifRbtcTooltip } from '@/components/RifRbtcTooltip/RifRbtcTooltip'
import { USD } from '@/lib/constants'
import { TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { ReactElement, useMemo } from 'react'

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
        <Span variant="tag" className="text-v3-bg-accent-0">
          Unclaimed Rewards
        </Span>
        <div className="flex items-center gap-2">
          <span className="overflow-hidden text-v3-text-100 text-ellipsis font-kk-topo text-[2rem] not-italic font-normal leading-[2.5rem] uppercase">
            {formatCurrency(usdValue, {
              currency,
              showCurrency: false,
              showCurrencySymbol: false,
            })}
          </span>
          <RifRbtcTooltip rbtcValue={rbtcEarnings} rifValue={rifEarnings}>
            <DottedUnderlineLabel
              className="text-v3-text-100 text-right font-rootstock-sans text-lg not-italic font-bold leading-6 decoration-[8%] pt-3"
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
      <ConditionalTooltip
        conditionPairs={[
          {
            condition: () => !isClaimable,
            lazyContent: () => 'Rewards are not claimable',
          },
        ]}
      >
        <Button
          variant="secondary-outline"
          className="font-rootstock-sans w-fit"
          textClassName="text-v3-text-100"
          onClick={() => claimRewards()}
        >
          Claim Rewards
        </Button>
      </ConditionalTooltip>
    </div>
  )
}
