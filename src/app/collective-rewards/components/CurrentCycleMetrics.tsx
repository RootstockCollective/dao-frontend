import { RIFToken } from '@/app/backing/components/RIFToken/RIFToken'
import { ActionsContainer } from '@/components/containers'
import { Metric } from '@/components/Metric'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { WeiPerEther } from '@/lib/constants'
import { usePricesContext } from '@/shared/context'
import { DateTime, Duration } from 'luxon'
import { parseEther } from 'viem'
import { useCycleContext } from '../metrics/context'
import { useGetTotalAllocation } from '../metrics/hooks'
import { formatSymbol } from '../rewards/utils'
import { useGetCycleRewards } from '../shared/hooks/useGetCycleRewards'
import { useGetGaugesArray } from '../user/hooks/useGetGaugesArray'

const CycleEndingOn = ({ cycleNext }: { cycleNext: DateTime }) => {
  return <Metric title="Cycle ending on"> {cycleNext.toFormat('EEE, dd MMM')}</Metric>
}

const CycleDay = ({ duration }: { duration: Duration }) => {
  return <Metric title="Day">8/{duration.toHuman()}</Metric>
}

const CycleNumber = ({ duration }: { duration: Duration }) => {
  // FIXME: Review the start date
  const startDate = DateTime.fromMillis(1730398168000)
  const durationInDays = duration.as('days')
  const now = DateTime.now()
  const totalDuration = now.diff(startDate, 'days')
  const cycleNumber = Math.floor(totalDuration.as('days') / durationInDays)
  return <Metric title="Cycle"> {cycleNumber}</Metric>
}

const TotalBacking = ({ totalAllocations }: { totalAllocations: bigint }) => {
  return (
    <Metric title="Total backing">
      {' '}
      {formatSymbol(totalAllocations, 'StRIF')} <RIFToken />{' '}
    </Metric>
  )
}

const EstimatedRewards = () => {
  const {
    data: cycleRewards,
    isLoading: cycleRewardsLoading,
    error: cycleRewardsError,
  } = useGetCycleRewards()

  const { prices } = usePricesContext()
  const rifPrice = prices.RIF?.price ?? 0
  const rbtcPrice = prices.RBTC?.price ?? 0

  const rifPriceInWei = parseEther(rifPrice.toString())
  const rbtcPriceInWei = parseEther(rbtcPrice.toString())

  const rifAmount = cycleRewards?.rifRewards ?? 0n
  const rbtcAmount = cycleRewards?.rbtcRewards ?? 0n
  const rifAmountInFiat = (rifAmount * rifPriceInWei) / WeiPerEther
  const rbtcAmountInFiat = (rbtcAmount * rbtcPriceInWei) / WeiPerEther
  return (
    <Metric title="Estimated rewards">
      <div className="flex flex-col gap-2">
        <TokenAmountDisplay
          amount={formatSymbol(rifAmount, 'RIF')}
          tokenSymbol={'RIF'}
          amountInCurrency={formatSymbol(rifAmountInFiat, 'USD')}
        />
        <TokenAmountDisplay
          amount={formatSymbol(rbtcAmount, 'RBTC')}
          tokenSymbol={'RBTC'}
          amountInCurrency={formatSymbol(rbtcAmountInFiat, 'USD')}
        />
      </div>
    </Metric>
  )
}

export const CurrentCycleMetrics = () => {
  const {
    data: { cycleDuration, cycleNext },
    // FIXME
    isLoading: cycleLoading,
    error: cycleError,
  } = useCycleContext()

  // FIXME: this is a hack to get the duration in days or hours, but I don't think we need to do it
  const duration =
    cycleDuration.as('days') < 1 ? cycleDuration.shiftTo('hours') : cycleDuration.shiftTo('days')

  const { data: allGauges } = useGetGaugesArray()
  const gauges = allGauges ?? []
  const { data: totalAllocations, isLoading, error } = useGetTotalAllocation(gauges)

  return (
    <ActionsContainer
      className="flex flex-col gap-10 pl-6 pt-6 pr-6 pb-10 bg-v3-bg-accent-80"
      title="THE REWARDS AT WORK - CURRENT CYCLE"
    >
      <div className="flex justify-between items-start w-full">
        {/* Format is still missing */}
        <CycleNumber duration={duration} />
        <CycleEndingOn cycleNext={cycleNext} />
        <CycleDay duration={duration} />
        <TotalBacking totalAllocations={totalAllocations} />
        <EstimatedRewards />
      </div>
    </ActionsContainer>
  )
}
