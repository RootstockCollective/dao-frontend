import {
  Allocations,
  AllocationsContext,
} from '@/app/collective-rewards/allocations/context/AllocationsContext'
import { formatSymbol, getFiatAmount } from '@/app/collective-rewards/rewards'
import { Button } from '@/components/ButtonNew'
import { KotoQuestionMarkIcon } from '@/components/Icons/KotoQuestionMarkIcon'
import { TokenAmountDisplay } from '@/components/TokenAmountDisplay'
import { Tooltip } from '@/components/Tooltip'
import { Typography } from '@/components/TypographyNew/Typography'
import { RIF, stRIF, USD } from '@/lib/constants'
import { formatCurrency } from '@/lib/utils/utils'
import { usePricesContext } from '@/shared/context'
import { useRouter } from 'next/navigation'
import { useContext, useMemo } from 'react'
import { Address } from 'viem'

interface AvailableBackingMetricProps {
  availableForBacking: string
  availableBackingUSD: string
  onStakeClick?: () => void
  onDistributeClick?: () => void
}

const StakeButton = ({ onStakeClick }: { onStakeClick?: () => void }) => (
  <>
    <Button variant="primary" className="flex h-7 px-4 py-3 items-center gap-2" onClick={onStakeClick}>
      <Typography variant="tag-s" className="text-v3-bg-accent-100">
        Stake RIF
      </Typography>
    </Button>
  </>
)

const DistributeButton = ({ onDistributeClick }: { onDistributeClick?: () => void }) => (
  <div className="flex items-center gap-3">
    <Button
      variant="secondary-outline"
      className="flex h-7 px-2 py-1 items-center gap-2"
      onClick={onDistributeClick}
    >
      <Typography
        variant="tag-s"
        className="text-white font-rootstock-sans text-sm font-normal leading-[145%]"
      >
        Distribute equally
      </Typography>
    </Button>
    <div className="flex w-4 py-[6px] flex-col justify-center items-center self-stretch aspect-square">
      <Tooltip
        text={
          <div className="flex w-[269px] p-6 flex-col items-start gap-2">
            <Typography className="self-stretch text-v3-bg-accent-100 font-rootstock-sans text-[14px] font-normal leading-[145%]">
              You&apos;ll be distributing equally to each of the Builders below
            </Typography>
          </div>
        }
        side="top"
        align="center"
        alignOffset={-60}
        sideOffset={10}
        className="bg-v3-text-80 rounded-[4px] shadow-lg"
      >
        <KotoQuestionMarkIcon />
      </Tooltip>
    </div>
  </div>
)

export const AvailableBackingMetric = () => {
  const {
    state: {
      backer: { balance, amountToAllocate, allocationsCount },
      allocations,
    },
    initialState: {
      backer: { balance: totalVotingPower },
    },
    actions: { updateAmountToAllocate },
  } = useContext(AllocationsContext)
  const { prices } = usePricesContext()
  const router = useRouter()

  const availableForBacking = balance - amountToAllocate
  const availableBackingUSD = useMemo(() => {
    const rifPriceUsd = prices[RIF]?.price ?? 0

    return !availableForBacking || !rifPriceUsd
      ? formatCurrency(0, { currency: USD, showCurrency: true })
      : formatCurrency(getFiatAmount(availableForBacking, rifPriceUsd), {
          currency: USD,
          showCurrency: true,
        })
  }, [availableForBacking, prices[RIF]])

  const handleDistributeClick = () => {
    //FIXME: Take into the inactive builders
    updateAmountToAllocate(balance) // TODO why are we setting the balance as the amount to allocate?
    let newAllocations: Allocations = {}
    if (allocationsCount > 0) {
      newAllocations = Object.keys(allocations).reduce((acc, key) => {
        const builderAddress = key as Address
        const newAllocation = availableForBacking / BigInt(allocationsCount) + allocations[builderAddress]
        acc[builderAddress] = newAllocation

        return acc
      }, {} as Allocations)
    }
  }

  const actions =
    availableForBacking > 0n ? (
      <DistributeButton onDistributeClick={handleDistributeClick} />
    ) : (
      <StakeButton onStakeClick={() => router.push('/user?action=stake')} />
    )

  return (
    <TokenAmountDisplay
      label="Available for backing"
      amount={formatSymbol(availableForBacking, stRIF)}
      tokenSymbol={stRIF}
      amountInCurrency={availableBackingUSD}
      actions={actions}
    />
  )
}
