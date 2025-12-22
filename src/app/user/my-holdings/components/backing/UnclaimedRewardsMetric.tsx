'use client'

import { Span } from '@/components/Typography'

import { useBackerRewardsContext, useClaimBackerRewards } from '@/app/collective-rewards/rewards'
import { useHandleErrors } from '@/app/collective-rewards/utils'
import { ConditionalTooltip } from '@/app/components'
import { MetricTooltipContent } from '@/app/components/Metric/MetricTooltipContent'
import { MetricToken } from '@/app/components/Metric/types'
import { createMetricToken } from '@/app/components/Metric/utils'
import { FiatTooltipLabel } from '@/app/components/Tooltip/FiatTooltipLabel/FiatTooltipLabel'
import { getFiatAmount } from '@/app/shared/formatter'
import { Button } from '@/components/Button'
import { REWARD_TOKEN_KEYS, TOKENS } from '@/lib/tokens'
import { formatCurrency } from '@/lib/utils'
import { usePricesContext } from '@/shared/context'
import { useModal } from '@/shared/hooks/useModal'
import ClaimRewardsModal from '@/app/collective-rewards/components/ClaimRewardModal/ClaimRewardsModal'
import Big from 'big.js'
import { ReactElement, useMemo } from 'react'

export const UnclaimedRewardsMetric = (): ReactElement => {
  const { isModalOpened, openModal, closeModal } = useModal()
  const { prices } = usePricesContext()
  const { data: rewardsPerToken, error } = useBackerRewardsContext()

  useHandleErrors({ error, title: 'Error loading rewards' })

  const { claimRewards, isClaimable } = useClaimBackerRewards()

  const { metricTokens, total } = useMemo(
    () =>
      REWARD_TOKEN_KEYS.reduce<{ metricTokens: MetricToken[]; total: Big }>(
        ({ metricTokens, total }, tokenKey) => {
          const { symbol, address } = TOKENS[tokenKey]
          const price = prices[symbol]?.price ?? 0
          const value = Object.values((rewardsPerToken?.[address] ?? { earned: 0n }).earned).reduce(
            (acc, earned) => acc + earned,
            0n,
          )

          return {
            metricTokens: [...metricTokens, createMetricToken({ symbol, value, price })],
            total: total.add(getFiatAmount(value, prices[symbol]?.price ?? 0)),
          }
        },
        {
          metricTokens: [],
          total: Big(0),
        },
      ),
    [rewardsPerToken, prices],
  )

  return (
    <div className="flex flex-col w-64 gap-4 items-start ">
      <div className="flex flex-col items-start gap-2 self-stretch">
        <Span variant="tag" className="text-v3-bg-accent-0">
          Unclaimed Rewards
        </Span>
        <div className="flex items-center gap-2">
          <span className="overflow-hidden text-v3-text-100 text-ellipsis font-kk-topo text-[2rem] not-italic font-normal leading-[2.5rem] uppercase">
            {formatCurrency(total)}
          </span>
          <FiatTooltipLabel
            tooltip={{ text: <MetricTooltipContent tokens={metricTokens} />, side: 'top' }}
            className="text-v3-text-100 text-right font-rootstock-sans text-lg not-italic font-bold leading-6 decoration-[8%] pt-3"
            style={{
              textDecorationSkipInk: 'auto',
              textUnderlinePosition: 'from-font',
            }}
          />
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
          onClick={() => openModal()}
        >
          Claim Rewards
        </Button>
      </ConditionalTooltip>
      <ClaimRewardsModal open={isModalOpened} onClose={() => closeModal()} isBacker={true} />
    </div>
  )
}
